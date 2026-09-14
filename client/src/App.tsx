import usePlayAgainModal from "./feature/play-again/ui/UsePlayAgainModal";
import StartScreen from "./screens/StartScreen/StartScreen";

export default function App() {
  return (
    <>
      <div className="bg-zinc-900 text-white min-h-screen flex items-center justify-center">
        <usePlayAgainModal />
      </div>
    </>
  );
}
