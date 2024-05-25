import React from "react";
import styles from "./company-widget.module.css";

const CompanyWidget = ({ companyData }) => {


  if (!companyData || !companyData._embedded || !companyData._embedded.enheter) {
    return (
      <div className={`${styles.weatherWidget} ${styles.weatherEmptyState}`}>
        <div className={styles.weatherWidgetdata}>
          <p>Her kommer info om selskapet du sjekker</p>
          <p>Prøv: Finn offentlig info på Equinor ASA</p>
        </div>
      </div>
    );
  }

  const rawcompanyName = companyData._embedded.enheter[0].navn;
  const companyName = rawcompanyName.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  // Check if the last word is two characters only
  const words = companyName.split(" ");
  const lastWord = words[words.length - 1];
  if (lastWord.length === 2 || lastWord.length === 3) {
    words[words.length - 1] = lastWord.toUpperCase();
  }

  const formattedCompanyName = words.join(" ");
  const url = companyData._embedded.enheter[0].hjemmeside;

  // Her må jeg sjekke hvilken valuta som er brukt i resultatregnskapet og så formatere på den måte.
  const aarsresultat = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" }).format(companyData.resultatregnskapResultat.aarsresultat);
  const sumKortsiktigGjeld = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" }).format(companyData.egenkapitalGjeld.gjeldOversikt.kortsiktigGjeld.sumKortsiktigGjeld);
  const sumLangsiktigGjeld = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" }).format(companyData.egenkapitalGjeld.gjeldOversikt.langsiktigGjeld.sumLangsiktigGjeld);
  const selskapstype = companyData._embedded.enheter[0].organisasjonsform.beskrivelse;

  return (
    <div className={`${styles.weatherWidget} ${styles.weatherBGSunny}`}>
      <div className={styles.weatherWidgetData}>
        <p>{selskapstype}</p>
        {url ? <>
          <a href={url} target="_blank" rel="noreferrer">
            <h2>{formattedCompanyName}</h2>
          </a>
        </> : <h2>{formattedCompanyName}</h2>}
        <p>Årsresultat {aarsresultat}</p>
        <p>Kortsiktig gjeld {sumKortsiktigGjeld}</p>
        <p>Langsiktig gjeld {sumLangsiktigGjeld}</p>
      </div>
    </div>
  );
};

export default CompanyWidget;
