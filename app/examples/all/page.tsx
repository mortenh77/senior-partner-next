"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import Chat from "../../components/chat";
import WeatherWidget from "../../components/company-widget";
import { getCompanyInfo } from '@/app/utils/brreg';
import FileViewer from "../../components/file-viewer";
import CompanyWidget from "../../components/company-widget";

const FunctionCalling = () => {
  const [companyData, setCompanyData] = useState({});

  const functionCallHandler = async (call) => {
    if (call?.function?.name === "get_company_info") {
      const args = JSON.parse(call.function.arguments);
      const data = await getCompanyInfo(args.name);
      setCompanyData(data);
      return JSON.stringify(data);
    } else if (call?.function?.name === "get_company_info") {

    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.column}>
          <CompanyWidget companyData={companyData} />
          <FileViewer />
        </div>
        <div className={styles.chatContainer}>
          <div className={styles.chat}>
            <Chat functionCallHandler={functionCallHandler} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default FunctionCalling;
