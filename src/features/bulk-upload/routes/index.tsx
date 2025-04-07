import BulkUploadContainer from "../components/BulkUploadContainer";

function BulkUploadPage() {
  const handleBulkUploadComplete = (data: Record<string, unknown>[]) => {
    console.log("Bulk upload completed:", data);
    // Handle the completed upload (e.g., display a success message, update UI, etc.)
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Data Import Tool</h1>
          <p className="text-gray-600">
            Upload and process Excel files with our intelligent bulk upload
            feature.
          </p>
        </header>

        <main>
          <BulkUploadContainer
            onComplete={handleBulkUploadComplete}
            className="w-full"
          />
        </main>
      </div>
    </div>
  );
}

export default BulkUploadPage;
