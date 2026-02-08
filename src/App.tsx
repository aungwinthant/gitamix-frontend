import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useSeparationJob } from './hooks/useSeparationJob';
import { LandingView } from './components/LandingView';
import { ProcessingView } from './components/ProcessingView';
import { Mixer } from './components/Mixer';
import { Header } from './components/layout/Header';
import { AuthCallback } from './pages/AuthCallback';

import { LibraryView } from './components/LibraryView';

import { AuthGate } from './components/auth/AuthGate';
import { LoginModal } from './components/auth/LoginModal';
import { MixerPage } from './pages/MixerPage';
import { DebugPage } from './pages/DebugPage';

// Home Component
function Home() {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    jobId,
    upload,
    isUploading,
    uploadError,
    status,
    statusError,
    progress,
    result,
    reset,
    loadJob
  } = useSeparationJob();

  // Handle deep linking / navigation from library
  useEffect(() => {
    const jobIdParam = searchParams.get('jobId');
    if (jobIdParam) {
      loadJob(jobIdParam);
      // Optional: Clear the param so it doesn't stick around if we reset?
      // For now, let's leave it or remove it to keep URL clean.
      // Removing it makes the most sense so 'reset' works expectedly later.
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, loadJob, setSearchParams]);

  // Determine current view
  const showUpload = status === 'idle' && !isUploading;
  const showProcessing = isUploading || ['pending', 'uploading', 'separating', 'failed'].includes(status);
  const showMixer = status === 'completed' && result && isAuthenticated;
  const showAuthGate = status === 'completed' && result && !isAuthenticated;

  return (
    <>
      <Header showNewUploadButton={status !== 'idle'} onNewUpload={reset} />
      <main className="flex-1 flex flex-col items-center justify-center">
        {showUpload && (
          <LandingView
            onUpload={upload}
            isUploading={isUploading}
            error={uploadError}
            isAuthenticated={isAuthenticated}
            onLoginRequest={() => setShowLoginModal(true)}
          />
        )}
        {showProcessing && <ProcessingView status={status === 'idle' ? 'uploading' : status as import('./types/api').JobStatus} progress={progress} error={statusError as Error || uploadError} />}
        {showAuthGate && <AuthGate />}
        {showMixer && <Mixer stems={result.stems} jobId={jobId!} metadata={result.metadata} waveforms={result.waveforms} onReset={reset} />}

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </main>
    </>
  );
}

function Library() {
  return (
    <>
      <Header showNewUploadButton={true} onNewUpload={() => window.location.href = '/'} />
      <main className="flex-1 flex flex-col mt-8">
        <LibraryView />
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500/30">
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/library/:jobId/mixer" element={<MixerPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
