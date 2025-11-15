const evidenceHash = args[0];
const taskDescription = args[1];

const ipfsUrl = `https://ipfs.io/ipfs/${evidenceHash}`;
const evidenceResponse = await Functions.makeHttpRequest({
  url: ipfsUrl,
  method: "GET"
});

if (evidenceResponse.error) {
  throw Error("Failed to fetch evidence from IPFS");
}

const aiRequest = Functions.makeHttpRequest({
  url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  params: {
    key: secrets.GEMINI_API_KEY
  },
  data: {
    contents: [{
      parts: [{
        text: `Analyze if this evidence proves task completion:\n\nTask: ${taskDescription}\nEvidence: ${JSON.stringify(evidenceResponse.data)}\n\nRespond with JSON: {"verified": true/false, "confidence": 0-100, "reason": "explanation"}`
      }]
    }]
  }
});

const aiResponse = await aiRequest;

if (aiResponse.error) {
  throw Error("AI verification failed");
}

const result = JSON.parse(aiResponse.data.candidates[0].content.parts[0].text);

return Functions.encodeUint256(result.verified ? 1 : 0);
