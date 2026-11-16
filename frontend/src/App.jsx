import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, Leaf, Loader2, AlertTriangle, Activity, Layers, Cpu, Sparkles, CheckCircle2, Sun, Moon } from 'lucide-react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Theme Toggle: Defaults to false (Original Dark Cyberpunk Mode)
  const [isLight, setIsLight] = useState(false);

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

  const ConfidenceBar = ({ disease, confidence }) => {
    const isHealthy = disease === 'Healthy';
    const gradient = isHealthy 
      ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
      : 'bg-gradient-to-r from-rose-500 to-orange-400';
    
    const textColor = isHealthy 
      ? (isLight ? 'text-emerald-700' : 'text-emerald-400') 
      : (isLight ? 'text-rose-700' : 'text-rose-400');

    return (
      <div className="mt-3">
        <div className="flex justify-between items-end mb-1.5">
          <p className={`text-base font-bold tracking-wide ${textColor} ${!isLight && 'drop-shadow-md'}`}>{disease}</p>
          <span className={`text-xs font-mono font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{confidence.toFixed(1)}%</span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800/80 shadow-inner border border-slate-700'}`}>
          <div 
            className={`h-full rounded-full ${gradient} transition-all duration-1000 ease-out ${!isLight && 'shadow-[0_0_10px_rgba(255,255,255,0.2)]'}`} 
            style={{ width: `${confidence}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-emerald-500/30 relative overflow-hidden transition-colors duration-300 ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-200'}`}>
      
      {/* Background Gradients */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none ${isLight ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/50 via-slate-50/0 to-slate-50/0' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950/0 to-slate-950/0'}`}></div>
      
      <div className="max-w-7xl mx-auto p-6 lg:p-10 relative z-10">
        <header className={`flex items-center justify-between mb-12 pb-6 border-b ${isLight ? 'border-slate-200' : 'border-slate-800/60'}`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-emerald-100 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20 backdrop-blur-md'}`}>
              <Leaf className={`w-8 h-8 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400'}`}>
                CropResQ
              </h1>
              <p className={`text-sm font-medium tracking-wide mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Multi-Model Ensemble Architecture</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Status Badge */}
            <div className={`hidden md:flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-full border ${isLight ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isLight ? 'bg-emerald-600' : 'bg-emerald-400'}`}></span>
              <span>SYSTEM ONLINE</span>
            </div>

            {/* Theme Toggle Button */}
            <button 
              onClick={() => setIsLight(!isLight)}
              className={`p-2 rounded-lg border transition-all ${isLight ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
              title="Toggle Theme"
            >
              {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload Hub */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`p-6 rounded-2xl border relative group ${isLight ? 'bg-white border-slate-200 shadow-lg' : 'bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl'}`}>
              <h2 className={`text-lg font-bold mb-5 flex items-center ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                <UploadCloud className={`w-5 h-5 mr-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                Input Telemetry
              </h2>
              
              <label className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isLight ? 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400' : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/70 hover:border-emerald-500/50'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <div className={`p-4 rounded-full mb-3 ${isLight ? 'bg-white shadow-sm' : 'bg-slate-800 shadow-inner'}`}>
                    <UploadCloud className={`w-8 h-8 ${isLight ? 'text-emerald-600' : 'text-emerald-500'}`} />
                  </div>
                  <p className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Drag & drop agricultural scan</p>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Supports JPG, PNG (Max 5MB)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>

              {preview && (
                <div className="mt-5 animate-in slide-in-from-bottom-4 duration-500">
                  <div className={`relative rounded-xl overflow-hidden border mb-5 ${isLight ? 'border-slate-200 shadow-sm' : 'border-slate-700 shadow-lg'}`}>
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                    {!isLight && <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>}
                  </div>
                  
                  <button 
                    onClick={handleUpload} 
                    disabled={loading} 
                    className={`relative w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 ${isLight ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md' : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'}`}
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Executing Inference...</>
                    ) : (
                      <><Cpu className="w-5 h-5 mr-2" /> Initialize Architecture</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Diagnostics Dashboard */}
          <div className="lg:col-span-8">
            <div className={`p-6 lg:p-8 rounded-2xl border min-h-[500px] flex flex-col relative overflow-hidden ${isLight ? 'bg-white border-slate-200 shadow-lg' : 'bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl'}`}>
              <h2 className={`text-xl font-bold mb-8 flex items-center border-b pb-4 ${isLight ? 'text-slate-800 border-slate-200' : 'text-slate-100 border-slate-800'}`}>
                <Activity className={`w-5 h-5 mr-3 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                Analysis Diagnostics
              </h2>

              {!result && !loading && !error && (
                <div className={`flex-1 flex flex-col items-center justify-center ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Layers className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-medium tracking-wide">Awaiting visual input for processing...</p>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-emerald-500">
                  <div className="relative">
                    {!isLight && <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full blur-md animate-pulse"></div>}
                    <Loader2 className="w-12 h-12 animate-spin relative z-10" />
                  </div>
                  <p className="mt-6 font-mono text-sm tracking-widest animate-pulse text-emerald-400/80">RUNNING TENSOR OPERATIONS...</p>
                </div>
              )}

              {error && (
                <div className={`p-5 rounded-xl flex items-start ${isLight ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-rose-950/40 border border-rose-500/50 text-rose-200 shadow-[0_0_30px_rgba(225,29,72,0.1)]'}`}>
                  <AlertTriangle className={`w-6 h-6 mr-3 flex-shrink-0 ${isLight ? 'text-rose-600' : 'text-rose-500'}`} />
                  <div>
                    <h3 className={`font-bold mb-1 ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>Error</h3>
                    <p className={`text-sm ${!isLight && 'opacity-90'}`}>{error}</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                  {/* Final Consensus Hero */}
                  <div className={`p-6 rounded-xl border relative overflow-hidden ${isLight ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-950/80 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]'}`}>
                    <div className={`absolute top-0 left-0 w-1 h-full ${isLight ? 'bg-emerald-500' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}></div>
                    <p className={`text-sm tracking-widest font-bold uppercase flex items-center mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      <CheckCircle2 className={`w-4 h-4 mr-2 ${isLight ? 'text-emerald-600' : 'text-emerald-500'}`} />
                      Final Soft-Voting Consensus
                    </p>
                    <ConfidenceBar disease={result.ensembles["Full 3-Model"].disease} confidence={result.ensembles["Full 3-Model"].confidence} />
                  </div>

                  {/* Individual Models */}
                  <div>
                    <h3 className={`text-xs uppercase tracking-widest font-bold mb-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Base Architectures</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(result.individual).map(([model, data]) => (
                        <div key={model} className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'}`}>
                          <p className={`text-xs font-medium mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{model}</p>
                          <ConfidenceBar disease={data.disease} confidence={data.confidence} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gemini Expert LLM */}
                  <div className={`p-6 rounded-xl border ${isLight ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200' : 'bg-gradient-to-br from-indigo-950/40 to-purple-900/20 border-indigo-500/30'}`}>
                    <div className="flex items-start">
                      <div className={`p-2.5 rounded-lg border mr-4 ${isLight ? 'bg-white border-indigo-200' : 'bg-indigo-500/20 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]'}`}>
                        <Sparkles className={`w-5 h-5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-sm font-bold tracking-wide mb-2 uppercase flex items-center ${isLight ? 'text-indigo-900' : 'text-indigo-300'}`}>
                          Gemini Expert System
                          <span className={`ml-3 text-[10px] px-2 py-0.5 rounded-full border ${isLight ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>Advice</span>
                        </h3>
                        <div className={`text-sm leading-relaxed p-4 rounded-lg border ${isLight ? 'bg-white text-slate-700 border-indigo-100' : 'bg-slate-950/50 text-slate-300 border-indigo-500/20'}`}>
                          {result.advice.includes("LLM ERROR") ? (
                            <span className="text-rose-400 font-mono text-xs">{result.advice}</span>
                          ) : (
                            result.advice
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;