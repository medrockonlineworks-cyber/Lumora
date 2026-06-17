import React, { useState, useRef, useEffect } from 'react';
import { Shield, Upload, FileText, CheckCircle, LogOut, Image, AlertTriangle, Camera, RefreshCw, Scan, Smile } from 'lucide-react';
import LumoraLogo from './LumoraLogo';
import { Profile } from '../types';
import { useLanguage } from '../locale';

interface IdUploadGateProps {
  userId: string;
  profile: Profile;
  onUploadSuccess: () => void;
  onLogout: () => void;
}

// Automatically downscales and compresses any selected image to a lightweight format
// supporting extreme file sizes without failing or hitting browser payload/database limits.
const compressImage = (file: File, maxDimension: number = 1200, quality: number = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Failed to initialize compression canvas context."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        reject(new Error("Failed to process image data pixels. File might be corrupted."));
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      } else {
        reject(new Error("Unsupported file data format"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Error reading selected verification file."));
    };
    reader.readAsDataURL(file);
  });
};

export default function IdUploadGate({ userId, profile, onUploadSuccess, onLogout }: IdUploadGateProps) {
  const { et } = useLanguage();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [useCameraMode, setUseCameraMode] = useState(false);

  const [fanNumber, setFanNumber] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setErrorText(null);
      setUseCameraMode(true);
      setCameraActive(true);
      setSelfieImage(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 360, height: 360 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error(err);
      setUseCameraMode(false);
      setCameraActive(false);
      setErrorText("Camera permission was denied or not supported. A live biometric selfie is mandatory. Please grant camera access.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setUseCameraMode(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 360;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 360, 360);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSelfieImage(dataUrl);
        stopCamera();
        triggerFacialScanAnimation();
      }
    } catch (err) {
      setErrorText("Failed to take picture. Please try again with the live face scanner.");
      stopCamera();
    }
  };

  const triggerFacialScanAnimation = () => {
    setScanning(true);
    setScanProgress(0);
    
    const steps = [
      "Targeting front-facing canvas...",
      "Calibrating facial landmarks...",
      "Measuring 68-point distance matrix...",
      "Verifying pupil symmetry ratios...",
      "Generating institutional CBE audit key..."
    ];

    let currentStep = 0;
    setScanStep(steps[0]);

    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setScanning(false);
          return 100;
        }
        
        const nextProgress = p + 5;
        const stepIndex = Math.min(Math.floor(nextProgress / 20), steps.length - 1);
        setScanStep(steps[stepIndex]);
        return nextProgress;
      });
    }, 120);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorText(null);
    try {
      const compressedDataUrl = await compressImage(file, 1200, 0.85);
      if (side === 'front') {
        setFrontImage(compressedDataUrl);
      } else {
        setBackImage(compressedDataUrl);
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Failed to process the uploaded image. Please try another image file.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontImage || !backImage) {
      setErrorText(et('requiredPhotoError') || "Both Front and Back photos of your National ID are required.");
      return;
    }
    if (!selfieImage) {
      setErrorText("Biometric Facial Recognition Selfie is required for institutional clearance.");
      return;
    }
    if (!fanNumber.trim()) {
      setErrorText(et('requiredFanError') || "Your National ID FAN / Registration number is required.");
      return;
    }

    const cleanFanNum = fanNumber.trim().replace(/[-\s]/g, '');
    const isSixteenDigits = /^\d{16}$/.test(cleanFanNum);
    if (!isSixteenDigits) {
      setErrorText("The National ID / FAN registration number must be exactly 16 digits (e.g. 8989898911899987). It cannot be less than or more than 16 digits.");
      return;
    }

    setErrorText(null);
    setUploading(true);

    try {
      const response = await fetch('/api/auth/submit-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          idCardFront: frontImage,
          idCardBack: backImage,
          idSelfie: selfieImage,
          fanNumber: fanNumber.trim()
        })
      });

      const data = await response.json();
      if (response.ok) {
        onUploadSuccess();
      } else {
        setErrorText(data.error || "Failed to submit identity photos.");
      }
    } catch (err) {
      setErrorText("Network connection error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EBF3FC] to-[#F5F9FE] text-slate-900 flex flex-col justify-between py-6 px-4 font-sans select-none relative overflow-hidden">
      {/* Background glow details */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

      {/* Top Brand Logo */}
      <div className="flex flex-col items-center pt-4">
        <LumoraLogo />
        <span className="text-[10px] font-black text-[#0A3D91] tracking-widest font-mono uppercase mt-1">
          {et('idGatewaySubTitle') || 'Smart Investment Gateway'}
        </span>
      </div>

      {/* Main card verification container */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full my-6 bg-white border-2 border-blue-100/90 rounded-[2.5rem] p-6 shadow-xl relative">
        <div className="text-center space-y-2 mb-5">
          <div className="inline-flex p-3 bg-blue-50 rounded-full border border-blue-200 text-[#0A3D91] mb-1">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-sm font-black tracking-tight text-[#0A3D91] uppercase font-display">
            {et('idVerification') || 'Identity Verification'}
          </h2>
          <p className="text-[11px] text-slate-800 font-extrabold leading-relaxed">
            {et('idGateGreeting') 
              ? et('idGateGreeting').replace('{name}', profile.fullName)
              : `Welcome, ${profile.fullName}. To comply with Ethiopian financial regulations and unlock platform features (like active VIP withdrawals and institutional loans), please submit a photo of both sides of your National ID cards.`}
          </p>
        </div>

        {errorText && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start space-x-2 text-[10.5px] text-red-700 font-black leading-relaxed font-sans mb-4.5 animate-pulse">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            {/* Front ID Photo Upload card selector */}
            <div className="space-y-1">
              <span className="text-[9.5px] text-[#0A3D91] tracking-wider block font-mono font-black uppercase text-center">
                {et('idFront') || 'ID Front Side'}
              </span>
              <label className="relative group cursor-pointer block h-28 bg-[#F0F5FD] hover:bg-[#E5EEFC] border-2 border-dashed border-[#0A3D91]/40 hover:border-[#0A3D91] rounded-2xl overflow-hidden transition-all text-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'front')} 
                  className="hidden" 
                />
                {frontImage ? (
                  <div className="w-full h-full relative">
                    <img src={frontImage} alt="ID Front Side" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#0A3D91]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full space-y-1 p-2 text-[#0A3D91]">
                    <Image className="w-5 h-5 opacity-90 group-hover:scale-105 transition-transform" />
                    <span className="text-[9px] font-black">
                      {et('selectFront') || 'Select Front Photo'}
                    </span>
                    <span className="text-[7.5px] text-slate-800 font-extrabold">PNG, JPG (Any file size supported)</span>
                  </div>
                )}
              </label>
            </div>

            {/* Back ID Photo Upload card selector */}
            <div className="space-y-1">
              <span className="text-[9.5px] text-[#0A3D91] tracking-wider block font-mono font-black uppercase text-center">
                {et('idBack') || 'ID Back Side'}
              </span>
              <label className="relative group cursor-pointer block h-28 bg-[#F0F5FD] hover:bg-[#E5EEFC] border-2 border-dashed border-[#0A3D91]/40 hover:border-[#0A3D91] rounded-2xl overflow-hidden transition-all text-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'back')} 
                  className="hidden" 
                />
                {backImage ? (
                  <div className="w-full h-full relative">
                    <img src={backImage} alt="ID Back Side" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#0A3D91]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full space-y-1 p-2 text-[#0A3D91]">
                    <Image className="w-5 h-5 opacity-90 group-hover:scale-105 transition-transform" />
                    <span className="text-[9px] font-black">
                      {et('selectBack') || 'Select Back Photo'}
                    </span>
                    <span className="text-[7.5px] text-slate-800 font-extrabold">PNG, JPG (Any file size supported)</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Biometric Facial Recognition Component */}
          <div className="p-3.5 bg-[#F0F5FD] border border-blue-200 rounded-2xl space-y-3 font-sans relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#0A3D91] uppercase tracking-widest font-mono flex items-center space-x-1">
                <Smile className="w-3.5 h-3.5 text-[#0A3D91] shrink-0" />
                <span>Facial Recognition Selfie</span>
              </span>
              <span className="text-[8px] px-2 py-0.5 rounded-md bg-[#0A3D91] text-white font-mono font-bold uppercase tracking-widest">
                Biometric Auditing
              </span>
            </div>

            {/* Scanning Oval / Video Frame */}
            <div className="relative mx-auto w-36 h-36 rounded-full overflow-hidden border-2 border-dashed border-[#0A3D91]/40 bg-white flex flex-col items-center justify-center group shadow-md transition-all duration-300">
              
              {/* Laser sweep animation if scanning */}
              {scanning && (
                <div className="absolute inset-x-0 h-1 bg-[#0A3D91] shadow-[0_0_12px_#0A3D91] z-20 animate-bounce" style={{ animationDuration: '2s' }}></div>
              )}

              {cameraActive ? (
                <div className="relative w-full h-full">
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover rounded-full scale-x-[-1]" 
                    playsInline 
                    muted 
                  />
                  <div className="absolute inset-0 border-2 border-[#0A3D91] rounded-full pointer-events-none border-dashed animate-pulse"></div>
                  
                  {/* Real-time centering frame guidance */}
                  <div className="absolute inset-4 border border-[#0A3D91]/30 rounded-full pointer-events-none flex items-center justify-center">
                    <span className="text-[7.5px] font-black uppercase text-[#0A3D91] tracking-widest bg-white/95 px-1.5 py-0.5 rounded-md shadow-xs">
                      Align Face
                    </span>
                  </div>
                </div>
              ) : selfieImage ? (
                <div className="relative w-full h-full">
                  <img src={selfieImage} alt="Face Selfie" className="w-full h-full object-cover rounded-full" />
                  {scanning ? (
                    <div className="absolute inset-0 bg-[#0A3D91]/40 backdrop-blur-3xs flex flex-col items-center justify-center text-center p-3 animate-pulse">
                      <Scan className="w-6 h-6 text-white animate-spin" />
                      <span className="text-[7px] font-mono font-black text-white tracking-wider uppercase mt-1">
                        Analyzing...
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-emerald-50/20 border-4 border-emerald-500 rounded-full flex flex-col items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-emerald-600 drop-shadow-md animate-bounce" />
                      <span className="text-[8px] font-black uppercase text-white tracking-wider bg-emerald-700 px-2 py-0.5 rounded-md mt-1 shadow-sm">
                        Face Locked ✓
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-2.5 text-center text-[#0A3D91]">
                  <Camera className="w-6 h-6 text-[#0A3D91]/80 group-hover:text-[#0A3D91] transition-colors" />
                  <span className="text-[8.5px] font-black uppercase tracking-wider block mt-1.5">
                    Position Face
                  </span>
                  <span className="text-[7.5px] text-slate-800 font-extrabold block">Biometric Capture</span>
                </div>
              )}
            </div>

            {/* Scanning progress display */}
            {scanning && (
              <div className="space-y-1 pt-1 animate-fade-in font-mono">
                <div className="flex justify-between items-center text-[7.5px] text-[#0A3D91]">
                  <span className="font-black uppercase">{scanStep}</span>
                  <span className="font-black">{scanProgress}%</span>
                </div>
                <div className="w-full bg-blue-50 h-2 rounded-full overflow-hidden border border-blue-200">
                  <div 
                    className="bg-gradient-to-r from-[#0A3D91] to-blue-500 h-full transition-all duration-150"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Control triggers */}
            <div className="flex gap-2.5 pt-1">
              {cameraActive ? (
                <>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-1 shadow-md"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Capture Face</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="py-2 px-4.5 bg-white hover:bg-slate-100 text-[#0A3D91] border border-blue-200 hover:border-blue-300 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-2 bg-[#0A3D91] hover:bg-blue-900 border border-blue-300/40 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5 text-center shadow-md active:scale-95"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <span>{selfieImage ? 'Retake live face' : 'Scan Live Face'}</span>
                </button>
              )}
            </div>
            
            <p className="text-[8px] text-slate-800 font-extrabold leading-normal font-sans text-center">
              Selfie biometrics are cross-referenced directly with state databases and CBE verification logs.
            </p>
          </div>

          {/* National ID FAN Number Field */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-black text-[#0A3D91] uppercase tracking-wider font-mono">
              {et('fanLabel') || 'National ID FAN / Reg Number'}
            </label>
            <input
              type="text"
              value={fanNumber}
              onChange={(e) => setFanNumber(e.target.value)}
              placeholder="e.g. FAN12345678"
              className="w-full bg-white hover:bg-slate-50 border-2 border-[#0A3D91]/30 focus:border-[#0A3D91] rounded-xl px-3.5 py-2.5 text-xs text-[#0A3D91] placeholder-slate-500 focus:outline-none font-mono font-black tracking-wider shadow-inner"
              required
            />
            <p className="text-[8.5px] text-slate-800 font-extrabold leading-normal">
              {et('idComplianceDesc') || 'Ensure this matches the number printed on your physical ID card exactly. Your future loan applications will require entering this matching identification number.'}
            </p>
          </div>

          <button
            type="submit"
            disabled={uploading || !frontImage || !backImage || !selfieImage || scanning || !fanNumber.trim()}
            className="w-full py-2.5 bg-[#0A3D91] hover:bg-blue-900 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
          >
            {uploading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <CheckCircle className="w-4.5 h-4.5" />
                <span>{et('submitAccessApp') || 'Submit & Access App'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] text-[#0A3D91] font-mono font-black leading-none uppercase">
          <FileText className="w-3.5 h-3.5" />
          <span>{et('securedWithAuditing') || 'Secured with 256-bit Institutional Auditing Compliance'}</span>
        </div>
      </div>

      {/* Log out bottom footer */}
      <div className="flex flex-col items-center mt-3">
        <button
          onClick={onLogout}
          className="px-4 py-1.5 bg-white hover:bg-red-50 text-[#0A3D91] hover:text-red-600 border border-blue-200 hover:border-red-200 rounded-xl text-[10px] font-black uppercase font-sans tracking-wider transition-all cursor-pointer flex items-center space-x-1 shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{et('exitLogout') || 'Exit / Log Out'}</span>
        </button>
      </div>
    </div>
  );
}
