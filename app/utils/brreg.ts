'use server'

import axios from 'axios';
import fetch from 'node-fetch';
//const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');


const getCompanyInfo = async (companyName: string) => {
    try {
        const url = 'https://data.brreg.no/enhetsregisteret/api/enheter';
        const params = { navn: companyName, size: 1 };
        const response = await axios.get(url, { params, timeout: 5000 });

        if (response.status !== 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const organisasjonsData = response.data;
        const organisasjonsnummer = organisasjonsData._embedded.enheter[0].organisasjonsnummer;
        const regnskapData = await getLatestRegnskap(organisasjonsnummer);
        //const ownersData = await getCompanyOwners(organisasjonsnummer);
        //console.log('ownersData: ', ownersData);
        //const mergedData = { ...organisasjonsData, ...regnskapData, ...ownersData};
        const mergedData = { ...organisasjonsData, ...regnskapData};

        return mergedData;
    } catch (error) {
        return { output: "An error occurred getCompanyInfo", error };
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

    return { output: "An error occurred in getLatestRegnskap" };
};

const getCompanyOwners = async (organisasjonsnummer: string) => {
    try {
        const jwt_token = await getMaskinportenToken();
        console.log('jwt_token: ', jwt_token);
        const url = `https://aksjonaerivirksomhet.api.skatteetaten-test.no/v1/offentligmedhjemmel/aksjonaerer/${organisasjonsnummer}`;
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

        return { output: "An http error occurred in getCompanyOwners", error: response.status };
    } catch (error) {
        return { output: "An error occurred in getCompanyOwners", error };
    }
};
const getMaskinportenToken = async () => {
    
    // Variables from integration
    const kid = 'sors_as_integrasjonstest';
    const integration_id = 'fb6a0b92-c0cc-4895-8c22-536b47579e1a';
    const scope = 'skatteetaten:aksjonaer';
    
    // Environment specific variables
    const maskinporten_audience = 'https://test.maskinporten.no/';
    const maskinporten_token_url = 'https://test.maskinporten.no/token';
    
    const jwt_token = jwt.sign(
      {
        scope: scope,
        // resource: '' <-- if resource is needed for this API
      }, {
        key: fs.readFileSync('private_key.pem'),
        //passphrase: '[PASSWORD]' <-- if password needed
      }, {
        algorithm: 'RS512',
        audience: maskinporten_audience,
        issuer: integration_id,
        header: {kid: kid},
        expiresIn: 100,
        jwtid: crypto.randomUUID()
      }
    );
    
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    params.append('assertion', jwt_token);
    
    const response = await fetch(maskinporten_token_url, {
      method: 'post',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: params
    });
    
    const data = await response.json();
    console.log('data: ', data);
    return data.access_token;
};


export { getCompanyInfo };