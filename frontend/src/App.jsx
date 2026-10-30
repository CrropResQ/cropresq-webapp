import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, Leaf, Loader2, AlertCircle } from 'lucide-react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Pinging the FastAPI Docker container
      const response = await axios.post('http://localhost:8000/api/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to connect to the inference engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center space-x-3 mb-12">
          <Leaf className="w-10 h-10 text-emerald-500" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            CropResQ Inference Engine
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Upload Scan</h2>
            
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-300"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>

            {preview && (
              <div className="mt-6">
                <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-600 shadow-sm mb-4" />
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Run Ensemble Model'}
                </button>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            
            {!result && !error && !loading && (
              <div className="flex-1 flex items-center justify-center text-gray-500 italic">
                Awaiting image upload...
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-emerald-500">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="animate-pulse">Extracting features across 3 models...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Predicted Classification</p>
                  <p className={`text-2xl font-bold ${result.disease === 'Healthy' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.disease}
                  </p>
                </div>

                <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Ensemble Confidence (Soft Voting)</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-700 rounded-full h-2.5 mr-4 overflow-hidden">
                      <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: result.confidence }}></div>
                    </div>
                    <span className="text-lg font-mono font-medium text-cyan-400">{result.confidence}</span>
                  </div>
                </div>

                <div className="p-5 bg-emerald-900/20 rounded-lg border border-emerald-800/50">
                  <p className="text-sm text-emerald-500 font-semibold mb-2 flex items-center">
                    <Leaf className="w-4 h-4 mr-2" />
                    Gemini AI Advisory
                  </p>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {result.advice}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;