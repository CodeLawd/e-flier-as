import SimpleImageUpload from "../components/SimpleImageUpload";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-green-950">
      <main className="flex-grow py-8">
        <SimpleImageUpload />
      </main>
    </div>
  );
}
