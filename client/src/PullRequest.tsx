import { useState } from "react";
import { Button, Textarea, Text, Card, Title } from "@mantine/core";

export default function AIAnalyzer() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

 const handleAnalyze = async () => {
  setLoading(true);
  setResponse(null);

  try {
    const res = await fetch("http://localhost:5000/api/analyze"
        , {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input }),
    });

    // Check if the response is OK
    if (!res.ok) {
      setResponse(`⚠️ Server returned ${res.status}: ${res.statusText}`);
      return;
    }

    // Try parsing JSON safely
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      setResponse("⚠️ Server returned invalid JSON.");
      return;
    }

    console.log("AI Response:", data);

    // Handle different response types
    if (!data) {
      setResponse("⚠️ Empty response from server.");
    } else if (data.error) {
      setResponse("⚠️ Error: " + data.error);
    } else if (data.review) {
      setResponse(`📝 Code Review:\n${data.review}`);
    } else if (data.prediction) {
      setResponse(
        `💡 Feedback: ${data.prediction} (${(data.confidence * 100).toFixed(1)}%)`
      );
    } else {
      setResponse("⚠️ Unexpected response from server.");
    }
  } catch (err: any) {
    // Catch network or other unexpected errors
    setResponse("⚠️ Something went wrong: " + err.message);
  } finally {
    setLoading(false);
  }
};



  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Title order={2}>Paste Your PR text</Title>
      <Textarea
        placeholder="Paste code or feedback here..."
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        minRows={5}
        autosize
      />
      <Button fullWidth mt="md" onClick={handleAnalyze} loading={loading}>
        Get AI Analysis
      </Button>

      {response && (

        <Text mt="md" style={{ whiteSpace: "pre-line" }}>
          {response}
        </Text>
      )}
    </Card>
  );

}
