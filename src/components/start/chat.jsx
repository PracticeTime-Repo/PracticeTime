import { useState, useRef } from "react";
import "./chat.css";
import { FaArrowUp, FaSpinner } from "react-icons/fa";
import light from "./Frame.png";
import { FiChevronRight } from "react-icons/fi";
import copy from "./copy.png";
import { FiPlus } from "react-icons/fi";
import copyIcon from "./copyText.png";
import { FaCheckCircle } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";

const GEMINI_API_KEY = "AIzaSyAhC4gJXrvbM7UOTPBiu_a3qHl7TG83MPU"; // 🔐 Replace with your key

const Chat = () => {
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const extractTextFromImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const base64 = reader.result.split(",")[1];

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        inlineData: {
                          mimeType: file.type, // image/png, image/jpeg
                          data: base64,
                        },
                      },
                      {
                        text: `Extract the math question from this image. 
                        Return ONLY the exact text of the question(s), preserve all punctuation. 
                        If multiple questions exist, separate by new lines. 
                        Do NOT solve or explain the question.`,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 500,
                },
              }),
            }
          );

          const data = await res.json();
          const extracted = data?.candidates?.[0]?.content?.parts?.[0]?.text;

          console.log("Extracted question text:", extracted);

          resolve(extracted || "No question found.");
        } catch (err) {
          console.error("Error extracting question:", err);
          reject("Failed to process image.");
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const getAnswer = async (question) => {
    const prompt = ` ${question}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      }
    );
    const data = await res.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No answer found."
    );
  };

  const handleClick = async () => {
    setLoading(true);
    setResponse("");

    let finalQuestion = question;

    // If image uploaded and no text, extract text from image
    if (!finalQuestion && image) {
      finalQuestion = await extractTextFromImage(image);
      setQuestion(finalQuestion);
    }

    if (!finalQuestion && !image) {
      setResponse("❌ Please enter a question or upload an image.");
      setLoading(false);
      return;
    }

    const ans = await getAnswer(finalQuestion);

    setConversation((prev) => [
      ...prev,
      {
        question: image && !question ? "" : finalQuestion,
        image: image ? URL.createObjectURL(image) : null, // store image preview URL
        answer: ans,
      },
    ]);

    setResponse(ans);
    setQuestion("");
    setImage(null);
    setLoading(false);
    setIsChatStarted(true);
  };

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(e.target.files[0]);
    setQuestion("");
    setResponse("");
    if (file) {
      setImage(file);
      setShowUploadOptions(false);
    }
  };
  // const prompt = `
  // You are an expert elementary math tutor. Explain the solution to this grade 1-5 math question in simple,
  // step-by-step terms suitable for a child. Break down each logical step clearly and use the exact format specified.

  // QUESTION: ${question}

  // RESPONSE FORMAT:
  // Explanation:
  // Step 1: <Start with initial information>
  // Step 2: <Describe what happens>
  // Step 3: <Do the math or logic>
  // Step 4: <State the result>
  // ✅ So, the correct answer is <Correct Option Letter>. <Option Text>

  // IMPORTANT RULES:
  // 1. Always use exactly 4 steps
  // 2. End with the ✅ emoji and correct answer
  // 3. For fill-in-the-blank questions, provide the answer in the final step
  // 4. For order questions, list the correct order
  // 5. Keep explanations simple and clear;`;
  //   return (
  //     <div className="container">
  //       <div style={styles.chatcontainer}>
  //         <h1>
  //           <b>
  //             Ask for <span style={{ color: "green" }}>Help!</span>
  //           </b>
  //         </h1>
  //         <p>Upload or share a question and get hints, steps, and help!</p>

  //         <div style={styles.card}>
  //           <input
  //             style={styles.input}
  //             type="text"
  //             placeholder="Ask anything..."
  //             value={question}
  //             onChange={(e) => setQuestion(e.target.value)}
  //           />
  //           <input
  //             type="file"
  //             accept="image/*"
  //             onChange={(e) => {
  //               setImage(e.target.files[0]);
  //               setQuestion(""); // Clear previous question
  //               setResponse(""); // Clear previous response
  //             }}
  //             style={{ margin: "10px 0" }}
  //           />

  //           <div style={styles.buttonRow}>
  //             <button style={styles.uploadBtn}>+ Upload</button>
  //             <button onClick={handleClick} style={styles.hintBtn}>
  //               💡 Get Hint!
  //             </button>
  //           </div>
  //         </div>

  //         {loading && <p>⏳ Loading answer...</p>}
  //         {/* {response && (
  //             <div style={styles.chatBox}>
  //             <h3>🤖 Gemini AI:</h3>
  //             <pre style={{ whiteSpace: "pre-wrap" }}>{response}</pre>
  //             </div>
  //         )} */}
  //         {conversation.length > 0 && (
  //           <div style={styles.chatBox}>
  //             <h3>🧠 Conversation History</h3>
  //             {conversation.map((item, idx) => (
  //               <div key={idx} style={{ marginBottom: "20px" }}>
  //                 <p>
  //                   <b>🧒 You:</b> {item.question}
  //                 </p>
  //                 <p>
  //                   <b>🤖 Gemini:</b>
  //                 </p>
  //                 <pre style={{ whiteSpace: "pre-wrap" }}>{item.answer}</pre>
  //                 <hr />
  //               </div>
  //             ))}
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  {
    /* <div style={styles.card}>
    <div style={{ position: "relative" }}>
      <div style={styles.chatInputWrapper}>
        <input
          style={styles.input}
          type="text"
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        {showUploadOptions && (
          <div style={styles.dropdown}>
            <div
              style={styles.dropdownItem}
            >
              ☁️ Upload from drive
            </div>
            <div
              style={styles.dropdownItem}
              onClick={() => fileInputRef.current.click()}
            >
              📷 Add photos and files
            </div>
          </div>
        )}

        <button
          style={styles.uploadMainBtn}
          onClick={() => setShowUploadOptions(!showUploadOptions)}
        >
          + Upload
        </button>

        <button style={styles.hintBtn}>💡 Get Hint!</button>
        <button style={styles.micBtn}>🎤</button>
        <button
          onClick={handleClick}
          style={styles.sendBtn}
          disabled={loading}
        >
          {loading ? "⏳" : "➤"}
        </button>
      </div>
    </div>
  </div> */
  }
  //   return (
  //     <div
  //       className="container">
  //       {!isChatStarted ? (
  //         <div style={styles.chatcontainer}>
  //           <h1>
  //             <b>
  //               Ask for <span style={{ color: "green" }}>Help!</span>
  //             </b>
  //           </h1>
  //           <p>Upload or share a question and get hints, steps, and help!</p>

  //           <div style={styles.card1}>
  //             {/* Input row */}
  //             <div style={styles.inputRow}>
  //               <input
  //                 style={styles.input11}
  //                 type="text"
  //                 placeholder="Type your question..."
  //                 value={question}
  //                 onChange={(e) => setQuestion(e.target.value)}
  //               />
  //             </div>

  //             {/* Button row with Upload and Right Controls */}
  //             <div style={styles.actionRow}>
  //               <div>
  //                 {showUploadOptions && (
  //                   <div style={styles.dropdown}>
  //                     <div
  //                       style={styles.dropdownItem}
  //                       //   onClick={handleGoogleDriveUpload}
  //                     >
  //                       ☁️ Upload from drive
  //                     </div>
  //                     <div
  //                       style={styles.dropdownItem}
  //                       onClick={() => fileInputRef.current.click()}
  //                     >
  //                       📷 Add photos and files
  //                     </div>
  //                   </div>
  //                 )}

  //                 <button
  //                   style={styles.uploadMainBtn}
  //                   onClick={() => setShowUploadOptions(!showUploadOptions)}
  //                 >
  //                   + Upload
  //                 </button>
  //               </div>

  //               <div style={styles.rightActions}>
  //                 <button style={styles.hintBtn}>💡 Get Hint!</button>
  //                 <button
  //                   onClick={handleClick}
  //                   style={styles.sendBtn}
  //                   disabled={loading}
  //                 >
  //                   {loading ? "⏳" : "➤"}
  //                 </button>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       ) : (
  //         <div
  //           style={{
  //             flex: 1,
  //             display: "flex",
  //             flexDirection: "column",
  //             justifyContent: "space-between",
  //           }}
  //         >
  //           {/* <div style={styles.chatBox}>
  //             {conversation.map((item, idx) => (
  //               <div key={idx}>
  //                 <div style={{ textAlign: "right", margin: "10px" }}>
  //                   <span style={styles.userBubble}>🧒 {item.question}</span>
  //                 </div>
  //                 <div style={{ textAlign: "left", margin: "10px" }}>
  //                   <span style={styles.botBubble}>🤖 {item.answer}</span>
  //                 </div>
  //               </div>
  //             ))}
  //             {loading && <p>⏳ Thinking...</p>}
  //           </div> */}
  //           <div style={styles.chatBox}>
  //             {conversation.map((item, idx) => (
  //               <div key={idx}>
  //                 {/* User Question */}
  //                 <div style={{ textAlign: "right", margin: "10px" }}>
  //                   <span style={styles.userBubble}>{item.question}</span>
  //                 </div>

  //                 {/* Bot Response */}
  //                 <div
  //                   style={{
  //                     textAlign: "left",
  //                     margin: "10px",
  //                     display: "flex",
  //                     alignItems: "center",
  //                     gap: "5px",
  //                   }}
  //                 >
  //                   <span style={styles.botBubble}>{item.answer}</span>
  //                   <button
  //                     onClick={() => navigator.clipboard.writeText(item.answer)}
  //                     title="Copy"
  //                     style={styles.copyButton}
  //                   >
  //                     📋
  //                   </button>
  //                 </div>
  //               </div>
  //             ))}
  //             {loading && <p>⏳ Thinking...</p>}
  //           </div>

  //           <div style={styles.chatInputWrapper}>
  //             <input
  //               style={styles.input11}
  //               type="text"
  //               placeholder="Type your question..."
  //               value={question}
  //               onChange={(e) => setQuestion(e.target.value)}
  //             />
  //             {/* {showUploadOptions && (
  //               <div style={styles.dropdown}>
  //                 <div onClick={() => fileInputRef.current.click()}>
  //                   📁 Upload from Drive
  //                 </div>
  //                 <div onClick={() => handleImageUpload}>
  //                   📷 Add photos and files
  //                 </div>
  //               </div>
  //             )} */}
  //             {showUploadOptions && (
  //               <div style={styles.dropdown}>
  //                 <div
  //                   style={styles.dropdownItem}
  //                   onClick={() => handleImageUpload}
  //                 >
  //                   <span style={{ marginRight: "8px" }}>☁️</span> Upload from
  //                   Drive
  //                 </div>
  //                 <div
  //                   style={styles.dropdownItem}
  //                   onClick={() => handleImageUpload}
  //                 >
  //                   <span style={{ marginRight: "8px" }}>📷</span> Add photos and
  //                   files
  //                 </div>
  //               </div>
  //             )}

  //             <button
  //               style={styles.uploadMainBtn}
  //               onClick={() => setShowUploadOptions(!showUploadOptions)}
  //             >
  //               + Upload
  //             </button>

  //             <button style={styles.hintBtn}>💡 Get Hint!</button>
  //             <button style={styles.micBtn}>🎤</button>
  //             <button
  //               onClick={handleClick}
  //               style={styles.sendBtn}
  //               disabled={loading}
  //             >
  //               {loading ? "⏳" : "➤"}
  //             </button>
  //           </div>

  //           {/* <div style={styles.chatInputBar}>
  //             <input
  //               style={styles.input}
  //               type="text"
  //               placeholder="Type your question..."
  //               value={question}
  //               onChange={(e) => setQuestion(e.target.value)}
  //             />
  //   {image && (
  //     <div style={styles.previewContainer}>
  //       <img
  //         src={URL.createObjectURL(image)}
  //         style={styles.imagePreview}
  //       />
  //       <button style={styles.closeBtn} onClick={() => setImage(null)}>
  //         ❌
  //       </button>
  //     </div>
  //   )}

  //             <div style={{ position: "relative" }}>
  //               <button
  //                 onClick={() => setShowUploadOptions(!showUploadOptions)}
  //                 style={styles.uploadMainBtn}
  //               >
  //                 + Upload
  //               </button>

  //               <input
  //                 ref={fileInputRef}
  //                 type="file"
  //                 accept="image/*"
  //                 onChange={handleImageUpload}

  //                 style={{ display: "none" }}
  //               />
  //             </div>

  //             <div style={styles.buttonRow}>

  //               <button
  //                 onClick={handleClick}
  //                 style={{
  //                   ...styles.sendBtn,
  //                   backgroundColor: loading ? "#ccc" : "#fcd34d",
  //                   cursor: loading ? "not-allowed" : "pointer",
  //                 }}
  //                 disabled={loading}
  //               >
  //                 {loading ? "⏳" : "➤"}
  //               </button>
  //             </div>
  //           </div> */}
  //         </div>
  //       )}
  //     </div>
  //   );
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyToClipboard = (text, index) => {
    if (navigator.clipboard && window.isSecureContext) {
      // Modern API
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        })
        .catch((err) => {
          console.error("Clipboard API failed", err);
        });
    } else {
      // Fallback method
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed"; // Avoid scrolling
      textarea.style.opacity = "0"; // Hide visually
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        const successful = document.execCommand("copy");
        if (successful) {
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        } else {
          console.error("Fallback copy failed");
        }
      } catch (err) {
        console.error("Fallback copy error", err);
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="container">
      {!isChatStarted ? (
        <div className="chat-container">
          <h1>
            <b>
              Ask for <span style={{ color: "#7ED956" }}>Help!</span>
            </b>
          </h1>
          <p>Upload or share a question and get hints, steps, and help!</p>

          <div className="card1">
            {/* Row 1: Input */}
            {/* <div className="inputRow">
              <input
                className="input11"
                type="text"
                placeholder="Ask anything..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            {image && (
              <div className="previewContainer">
                <img
                  src={URL.createObjectURL(image)}
                  className="imagePreview"
                />
                <button className="closeBtn" onClick={() => setImage(null)}>
                  ❌
                </button>
              </div>
            )} */}
            <div className="inputWithPreview">
                {image && (
                  <div className="previewContainer">
                    <img
                      src={URL.createObjectURL(image)}
                      className="imagePreview"
                      alt="preview"
                    />
                    <button className="closeBtn" onClick={() => setImage(null)}>
                      <RxCross1 size={14} />
                    </button>
                  </div>
                )}

                <input
                  className="input11"
                  type="text"
                  placeholder="Ask anything..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

            <div className="actionRow">
              <div className="leftActions">
                {showUploadOptions && (
                  <div className="dropdown">
                    <div
                      className="dropdownItem"
                      onClick={() => console.log("Upload from Drive")}
                    >
                      <img
                        src={copy}
                        alt="Upload from Drive"
                        className="dropdownIcon"
                      />
                      <span className="dropdownText">Upload from Drive</span>
                      <FiChevronRight className="dropdownArrow" />
                    </div>

                    <div
                      className="dropdownItem"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <img
                        src={copy}
                        alt="Add photos and files"
                        className="dropdownIcon"
                      />
                      <span className="dropdownText">Add photos and files</span>
                      <FiChevronRight className="dropdownArrow" />
                    </div>
                  </div>
                )}

                <button
                  className={`uploadMainBtn ${
                    showUploadOptions ? "activeUpload" : ""
                  }`}
                  onClick={() => setShowUploadOptions(!showUploadOptions)}
                >
                  <FiPlus
                    className={`plusIcon ${
                      showUploadOptions ? "activeUpload" : ""
                    }`}
                  />
                  Upload
                </button>

                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </div>

              <div className="rightActions">
                <button className="hintBtn">
                  <img
                    src={light}
                    alt="Hint"
                    style={{
                      width: "18px",
                      height: "18px",
                      marginRight: "6px",
                    }}
                  />
                  Get Hint!
                </button>
                <button
                  className={`send-btn ${
                    (question.trim() || image) && !loading
                      ? "active"
                      : "disabled"
                  }`}
                  onClick={handleClick}
                  disabled={!(question.trim() || image) || loading}
                >
                  {loading ? <FaSpinner className="spin" /> : <FaArrowUp />}
                </button>{" "}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="chat-live">
          <div className="chat-container2">
            <div className="chat-header">
              <h1>
                <b>
                  Ask for <span style={{ color: "#7ED956" }}>Help!</span>
                </b>
              </h1>
              <p>Upload or share a question and get hints, steps, and help!</p>
            </div>
            <div className="divider-line"></div>
            <div className="chat-box">
              {conversation.map((item, idx) => (
                <div key={idx}>
                  {/* User message on right */}
                  <div className="message-row user-row">
                    {item.image && (
                      <img
                        src={item.image}
                        alt="Uploaded"
                        className="user-image"
                      />
                    )}

                    {item.question && (
                      <div className="user-bubble">{item.question}</div>
                    )}
                  </div>

                  {/* Bot response on left */}
                  <div className="message-row bot-row">
                    <div className="bot-bubble-wrapper">
                      <div className="bot-bubble">{item.answer}</div>
                      <button
                        onClick={() => handleCopyToClipboard(item.answer, idx)}
                        title="Copy to clipboard"
                        className="copy-button-below"
                      >
                        <img
                          src={copyIcon}
                          alt="Copy"
                          style={{
                            width: "18px",
                            height: "18px",
                            marginTop: "5px",
                            marginLeft: "15px",
                          }}
                        />
                      </button>
                      {copiedIndex === idx && (
                        <div className="copied-label">
                          <FaCheckCircle
                            color="#7ED956"
                            style={{ marginRight: "5px" }}
                          />
                          Copied!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="dot-loader">
                  <span className="dot bounce"></span>
                  <span className="dot bounce delay1"></span>
                  <span className="dot bounce delay2"></span>
                </div>
              )}
            </div>
            {/* <div className="inputRow">
                <input
                  className="input11"
                  type="text"
                  placeholder="Ask anything..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              {image && (
                <div className="previewContainer">
                  <img
                    src={URL.createObjectURL(image)}
                    className="imagePreview"
                    alt="preview"
                  />
                  <button className="closeBtn" onClick={() => setImage(null)}>
                    <RxCross1 size={14} />
                  </button>
                </div>
              )} */}
            <div className="card1 card-fixed">
              {/* Row 1: Input */}

              <div className="inputWithPreview">
                {image && (
                  <div className="previewContainer">
                    <img
                      src={URL.createObjectURL(image)}
                      className="imagePreview"
                      alt="preview"
                    />
                    <button className="closeBtn" onClick={() => setImage(null)}>
                      <RxCross1 size={14} />
                    </button>
                  </div>
                )}

                <input
                  className="input11"
                  type="text"
                  placeholder="Ask anything..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              {/* Row 2: Upload Left | Hint & Send Right */}
              <div className="actionRow">
                <div className="leftActions">
                  {showUploadOptions && (
                    <div className="dropdown">
                      <div
                        className="dropdownItem"
                        onClick={() => console.log("Upload from Drive")}
                      >
                        <img
                          src={copy}
                          alt="Upload from Drive"
                          className="dropdownIcon"
                        />
                        <span className="dropdownText">Upload from Drive</span>
                        <FiChevronRight className="dropdownArrow" />
                      </div>

                      <div
                        className="dropdownItem"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <img
                          src={copy}
                          alt="Add photos and files"
                          className="dropdownIcon"
                        />
                        <span className="dropdownText">
                          Add photos and files
                        </span>
                        <FiChevronRight className="dropdownArrow" />
                      </div>
                    </div>
                  )}

                  <button
                    className={`uploadMainBtn ${
                      showUploadOptions ? "activeUpload" : ""
                    }`}
                    onClick={() => setShowUploadOptions(!showUploadOptions)}
                  >
                    <FiPlus
                      className={`plusIcon ${
                        showUploadOptions ? "activeUpload" : ""
                      }`}
                    />
                    Upload
                  </button>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </div>

                <div className="rightActions">
                  <button className="hintBtn">
                    <img
                      src={light}
                      alt="Hint"
                      style={{
                        width: "18px",
                        height: "18px",
                        marginRight: "6px",
                      }}
                    />
                    Get Hint!
                  </button>
                  <button
                    className={`send-btn ${
                      (question.trim() || image) && !loading
                        ? "active"
                        : "disabled"
                    }`}
                    onClick={handleClick}
                    disabled={!(question.trim() || image) || loading}
                  >
                    {loading ? <FaSpinner className="spin" /> : <FaArrowUp />}
                  </button>{" "}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
{
  /* <div className="chat-input-wrapper">
              <input
                className="input11"
                type="text"
                placeholder="Type your question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />

              {showUploadOptions && (
                <div className="dropdown">
                  <div
                    className="dropdown-item"
                    onClick={() => handleImageUpload()}
                  >
                    <span style={{ marginRight: "8px" }}>☁️</span> Upload from
                    Drive
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => handleImageUpload()}
                  >
                    <span style={{ marginRight: "8px" }}>📷</span> Add photos
                    and files
                  </div>
                </div>
              )}

              <button
                className="upload-main-btn"
                onClick={() => setShowUploadOptions(!showUploadOptions)}
              >
                + Upload
              </button>

              <button className="hint-btn">💡 Get Hint!</button>
              <button className="mic-btn">🎤</button>
              <button
                onClick={handleClick}
                className="send-btn"
                disabled={loading}
              >
                {loading ? "⏳" : "➤"}
              </button>
            </div> */
}
// const styles = {
//   userBubble: {
//     display: "inline-block",
//     backgroundColor: "#f0f0f0",
//     borderRadius: "20px",
//     padding: "10px 15px",
//     maxWidth: "70%",
//     fontSize: "14px",
//   },
//   botBubble: {
//     display: "inline-block",
//     backgroundColor: "#ffffff",
//     borderRadius: "20px",
//     padding: "10px 15px",
//     maxWidth: "70%",
//     border: "1px solid #ddd",
//     fontSize: "14px",
//   },
//   copyButton: {
//     background: "none",
//     border: "none",
//     cursor: "pointer",
//     fontSize: "16px",
//     padding: "2px",
//   },

//   chatcontainer: {
//   display: "flex",
//   flexDirection: "column",
//   justifyContent: "center",
//   alignItems: "center",
//   minHeight: "80vh", // full vertical height
//   backgroundColor: "#fff",
//   fontFamily: "sans-serif",
//   textAlign: "center",
//   padding: "20px",
// },

//   card1: {
//     width:"80%",
//     background: "#fff",
//     margin: "20px auto",
//     padding: "20px",
//     borderRadius: "15px",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//   },

//   buttonRow: {
//     display: "flex",
//     justifyContent: "center",
//     gap: "10px",
//   },
//   uploadBtn: {
//     padding: "10px 16px",
//     borderRadius: "10px",
//     border: "1px solid #ccc",
//     backgroundColor: "#eee",
//     cursor: "pointer",
//   },

//   chatBox: {
//     background: "#fff",
//     margin: "30px auto",
//     maxWidth: "700px",
//     padding: "20px",
//     borderRadius: "10px",
//     textAlign: "left",
//     boxShadow: "0 0 10px rgba(0,0,0,0.1)",
//   },
//   inputRow: {
//     display: "flex",
//     alignItems: "center",
//     //   border: "1px solid #eee",
//     borderRadius: "30px",
//     padding: "10px 15px",
//     //   boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
//     backgroundColor: "#fff",
//     marginBottom: "12px",
//   },

//   actionRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",

//   },

//   rightActions: {
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//   },

//   chatInputWrapper: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: "10px 15px",
//     borderRadius: "30px",
//     //   boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
//     //   border: "1px solid #eee",
//     backgroundColor: "#fff",
//     gap: "10px",
//   },

//   input11: {
//     flex: 1,
//     border: "none",
//     fontSize: "16px",
//     outline: "none",
//     backgroundColor: "transparent",
//   },

//   uploadMainBtn: {
//     backgroundColor: "#fff",
//     color: "#000",
//     padding: "6px 12px",
//     borderRadius: "20px",
//     border: "1px solid #000",
//     cursor: "pointer",
//     fontSize: "14px",
//     fontWeight: "600",
//   },

//   hintBtn: {
//     backgroundColor: "#fff8e1",
//     color: "#f59e0b",
//     border: "2px solid #facc15",
//     padding: "6px 12px",
//     borderRadius: "20px",
//     fontSize: "14px",
//     fontWeight: "bold",
//     cursor: "pointer",
//   },

//   micBtn: {
//     backgroundColor: "#e0ffe0",
//     color: "green",
//     padding: "6px 10px",
//     borderRadius: "50%",
//     border: "none",
//     fontSize: "16px",
//     cursor: "pointer",
//   },

//   sendBtn: {
//     backgroundColor: "#3b82f6",
//     color: "white",
//     padding: "6px 10px",
//     borderRadius: "50%",
//     fontWeight: "bold",
//     fontSize: "16px",
//     border: "none",
//     cursor: "pointer",
//   },

//   dropdown: {
//     position: "absolute",
//     // bottom: "50px",
//     // left: "0",
//     backgroundColor: "#fff",
//     border: "1px solid #e0e0e0",
//     borderRadius: "12px",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//     zIndex: 1000,
//     padding: "8px 0",
//     width: "220px",
//     fontSize: "14px",
//   },

//   dropdownItem: {
//     display: "flex",
//     alignItems: "center",
//     padding: "10px 16px",
//     cursor: "pointer",
//     color: "#333",
//     transition: "background 0.2s",
//   },

//   previewContainer: {
//     position: "relative",
//     marginTop: "10px",
//     maxWidth: "300px",
//     height: "60px",
//   },
//   imagePreview: {
//     height: "100%",
//     borderRadius: "8px",
//   },
//   closeBtn: {
//     position: "absolute",
//     backgroundColor: "#fff",
//     borderRadius: "50%",
//     border: "1px solid #ccc",
//     cursor: "pointer",
//   },
// };

export default Chat;

// <div className="chat-container">
//   <h1>
//     <b>
//       Ask for <span style={{ color: "green" }}>Help!</span>
//     </b>
//   </h1>
//   <p>Upload or share a question and get hints, steps, and help!</p>

//   <div className="card1">
//     {/* Row 1: Input aligned to left */}
//     <div className="inputRow">
//       <input
//         className="input11"
//         type="text"
//         placeholder="Type your question..."
//         value={question}
//         onChange={(e) => setQuestion(e.target.value)}
//       />
//     </div>

//     {/* Row 2: Upload on left, other buttons on right */}
//     <div className="actionRow">
//       {/* Left side */}
//       <div className="leftActions">
//         {showUploadOptions && (
//           <div className="dropdown">
//             <div className="dropdownItem">☁️ Upload from Drive</div>
//             <div
//               className="dropdownItem"
//               onClick={() => fileInputRef.current.click()}
//             >
//               📷 Add photos and files
//             </div>
//           </div>
//         )}
//         <button
//           className="uploadMainBtn"
//           onClick={() => setShowUploadOptions(!showUploadOptions)}
//         >
//           + Upload
//         </button>
//       </div>

//       {/* Right side */}
//       <div className="rightActions">
//         <button className="hintBtn">💡 Get Hint!</button>
//         <button
//           onClick={handleClick}
//           className="sendBtn"
//           disabled={loading}
//         >
//           {loading ? "⏳" : "➤"}
//         </button>
//       </div>
//     </div>
//   </div>
// </div>
