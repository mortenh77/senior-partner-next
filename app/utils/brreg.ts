import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'fs';


const getCompanyInfo = async (companyName: string) => {
    try {
        const url = 'https://data.brreg.no/enhetsregisteret/api/enheter';
        const params = { navn: companyName, size: 1 };
        const response = await axios.get(url, { params, timeout: 5000 });

        if (response.status !== 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = response.data;
        const organisasjonsnummer = data._embedded.enheter[0].organisasjonsnummer;
        const regnskapData = await getLatestRegnskap(organisasjonsnummer);
        const ownersData = await getCompanyOwners(organisasjonsnummer);
        const mergedData = { ...data, ...regnskapData, ...ownersData};

        return mergedData;
    } catch (error) {
        console.error(`Error occurred: ${error}`);
        return { output: "An error occurred" };
    }
};

const getLatestRegnskap = async (organisasjonsnummer: string) => {
    const url = `https://data.brreg.no/regnskapsregisteret/regnskap/${organisasjonsnummer}`;
    const headers = { accept: 'application/json' };
    const response = await axios.get(url, { headers, timeout: 5000 });

    if (response.status === 200) {
        const regnskapData = response.data;
        if (regnskapData) {
            // Assuming the latest regnskap is the first one in the list
            return regnskapData[0];
        }
    }

    return { output: "An error occurred" };
};

const getCompanyOwners = async (organisasjonsnummer: string) => {
    const jwt_token = await getMaskinportenToken();
    const url = `https://aksjonaerivirksomhet.api.skatteetaten.no/v1/offentligmedhjemmel/aksjonaerer/${organisasjonsnummer}`;
    const headers = {
        'accept': 'application/json',
        'Authorization': `Bearer ${jwt_token}`
    };
    const response = await axios.get(url, { headers, timeout: 5000 });

    if (response.status === 200) {
        const ownersData = response.data;
        if (ownersData) {
            return ownersData;
        }
    }

    return { output: "An error occurred" };
};

const getMaskinportenToken = async () => {
    const privateKey = fs.readFileSync('path_to_your_private_key.pem');

    const token = jwt.sign({
        // Your claims go here
    }, privateKey, { algorithm: 'RS256' });

    const response = await axios.post('https://maskinporten.no/token', {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token
    });

    return response.data.access_token;
};


export { getCompanyInfo };