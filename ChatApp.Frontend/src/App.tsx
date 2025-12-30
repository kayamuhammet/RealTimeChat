import "./App.css";
import { SignalRProvider } from "./context/SignalRContext";
import { ChatPage } from "./pages/ChatPage";

function App() {
  return (
    <SignalRProvider>
      <ChatPage />
    </SignalRProvider>
  );
}

export default App;
