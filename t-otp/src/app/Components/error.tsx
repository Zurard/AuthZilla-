export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-green-400">
      <div className="text-center">
        <h1 className="text-4xl mb-4">Connection Error</h1>
        <p>Unable to connect to the authentication server.</p>
      </div>
    </div>
  );
}