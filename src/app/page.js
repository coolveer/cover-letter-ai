'use client'
import axios from "axios";
import styles from "./page.module.css";
import { useState } from "react";
import { SmileOutlined } from '@ant-design/icons';
import { Button, Spin, notification } from "antd";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Typewriter from 'typewriter-effect';
import copy from 'copy-to-clipboard';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState('');
  const [JD, setJD] = useState('');
  const [generatedText, setGeneratedText] = useState('')
  const [api, contextHolder] = notification.useNotification();

  const openNotification = () => {
    api.open({
      message: 'the text has been copied ',
      icon: <SmileOutlined style={{ color: '#108ee9' }} />,
    });
  };

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GIMINI_API_KEY);

  async function extractText(event) {
    if (event.target.files[0]) {
      setLoading(true)
      const file = event.target.files[0];
      var bodyFormData = new FormData();
      bodyFormData.append('PDF', file);
      const pdfData = await axios({
        method: "post",
        url: "/api/pdfupload",
        data: bodyFormData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      setLoading(false)
      setResumeData(pdfData.data.text)
    } else {
      alert('no file has been selected')
    }


  }

  async function run() {
    setLoading(true)
    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = ` based on this , ${resumeData}  , resume data create a cover letter for this job discription , ${JD} , provide the data in html format and make it properly indented`

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    setGeneratedText(text)
    setLoading(false)
  }

  return (
    <Spin spinning={loading} tip="Processing...">

      {contextHolder}
      <main className={styles.main}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2>Cover Letter AI</h2>
          <br />
          <p>Say hello to me ,<a style={{ color: "blue" }} href="https://www.linkedin.com/in/veer-pratap-singh/"> Veer</a> </p>
          <br />
          <p>Upload your latest Resume/CV (PDF)</p>
          <br />
          <input type="file" accept="application/pdf" onChange={(e) => extractText(e)} />
          <br />
          <textarea onChange={e => setJD(e.target.value)} style={{ width: "80vw", height: "30vh" }} placeholder="Copy and Paste the Job Discription here !" />
          <br />
          <Button onClick={() => run()}>Generate Cover Letter</Button>
          <br />
          {generatedText && <div> <span style={{ cursor: "pointer" }} onClick={() => { copy(generatedText.replace(/(<([^>]+)>)/ig, '')); openNotification() }}>click here to copy <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard-check" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0" />
            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z" />
            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z" />
          </svg></span> <br /> <br /> <Typewriter
              options={{
                strings: generatedText,
                autoStart: true,
                delay: 8,
                loop: false,
                deleteChars: 0
              }}
            /></div>}
        </div>
      </main>
    </Spin>
  );
}
