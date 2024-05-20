export let assistantId = "asst_2jNsQVEvIPDejVKyQRZIFnSo"; // set your assistant ID here

if (assistantId === "") {
  assistantId = process.env.OPENAI_ASSISTANT_ID;
}
