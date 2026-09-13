import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare, 
  Edit3, 
  ShieldCheck, 
  Send, 
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TelemedicineRoom: React.FC = () => {
  const { appointments, currentUser } = useApp();

  // State for pre-call test & room stage
  const [stage, setStage] = useState<'PRE_TEST' | 'CONSENT' | 'LIVE_CALL' | 'POST_CALL'>('PRE_TEST');
  
  // Device state
  const [isCamOn, setIsCamOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [micVolume] = useState<number>(65);
  const [consentAccepted, setConsentAccepted] = useState<boolean>(false);

  // Active appointment match or fallback to video appointment
  const videoAppointment = appointments.find(a => a.appointmentMode === 'VIDEO') || appointments[0];

  // Active panel tab inside call
  const [activeTab, setActiveTab] = useState<'CHAT' | 'WHITEBOARD' | 'RX_PREVIEW'>('CHAT');
  
  // Chat state
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'Dr. Anjali Verma', text: 'Hello! I am reviewing your child’s health notes now.', time: '11:30 AM' },
    { sender: 'Patient', text: 'Thank you doctor, she has a mild rash on her arms.', time: '11:31 AM' }
  ]);
  const [newMessage, setNewMessage] = useState<string>('');

  // Local Video Canvas / Stream Ref
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCamOn && stage !== 'POST_CALL') {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then(s => {
          stream = s;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.warn('Camera access fallback simulation active:', err);
        });
    }

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isCamOn, stage]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        sender: currentUser?.role === 'DOCTOR' ? (currentUser as any).name : 'Patient',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setNewMessage('');
  };

  // Canvas Whiteboard Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Telemedicine Header Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base">SEVASADAN HD Video Room</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/40">
                Live WebRTC
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Consultation ID: <span className="font-mono text-slate-200">{videoAppointment?.id || 'APT-2026-002'}</span> • Doctor: <strong>{videoAppointment?.doctorName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stage === 'LIVE_CALL' && (
            <span className="flex items-center gap-1.5 bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-xs font-bold border border-rose-500/40">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              LIVE RECORDING ENCRYPTED
            </span>
          )}
        </div>
      </div>

      {/* STAGE 1 & 2: Pre-call Device Check & Informed Consent */}
      {(stage === 'PRE_TEST' || stage === 'CONSENT') && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase">
              Pre-Call Device & Consent Check
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              {stage === 'PRE_TEST' ? 'Camera & Microphone Test' : 'Mandatory Telemedicine Consent'}
            </h2>
          </div>

          {stage === 'PRE_TEST' && (
            <div className="space-y-6">
              {/* Camera Preview Box */}
              <div className="relative h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                {isCamOn ? (
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform -scale-x-100" 
                  />
                ) : (
                  <div className="text-center text-slate-500 space-y-2">
                    <VideoOff className="w-12 h-12 mx-auto" />
                    <p className="text-xs font-bold">Camera Turned Off</p>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/80 backdrop-blur-md p-2 rounded-xl text-white">
                  <span className="text-xs font-semibold">Local Stream Preview</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsCamOn(!isCamOn)}
                      className={`p-2 rounded-lg text-xs font-bold ${isCamOn ? 'bg-emerald-600' : 'bg-rose-600'}`}
                    >
                      {isCamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => setIsMicOn(!isMicOn)}
                      className={`p-2 rounded-lg text-xs font-bold ${isMicOn ? 'bg-emerald-600' : 'bg-rose-600'}`}
                    >
                      {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Mic Audio Meter Indicator */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-emerald-600" />
                    Microphone Input Level
                  </span>
                  <span>{isMicOn ? `${micVolume}% (Normal)` : 'Muted'}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: isMicOn ? `${micVolume}%` : '0%' }}
                  />
                </div>
              </div>

              <button
                onClick={() => setStage('CONSENT')}
                className="w-full bg-[#0F4C81] hover:bg-[#0A365C] text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition"
              >
                Proceed to Informed Consent
              </button>
            </div>
          )}

          {stage === 'CONSENT' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Telemedicine Practice Guidelines 2020 Informed Consent</span>
                </div>
                <p>1. I hereby give explicit informed consent to undergo a virtual medical consultation with SEVASADAN medical practitioners.</p>
                <p>2. I understand that video consultations rely on remote audio-visual assessment and that physical in-person examination at Sarangpur, Shujalpur, or Rajgarh branches may be recommended if necessary.</p>
                <p>3. Standard digital prescriptions provided post-call carry equal medical validity.</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-2">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-[#0F4C81] focus:ring-[#0F4C81] mt-0.5"
                />
                <span className="text-xs font-semibold text-slate-800">
                  I have read and accept the Informed Digital Telemedicine Consent agreement.
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStage('PRE_TEST')}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-xs hover:bg-slate-200 transition"
                >
                  Back to Device Test
                </button>
                <button
                  disabled={!consentAccepted}
                  onClick={() => setStage('LIVE_CALL')}
                  className="flex-1 bg-[#10B981] hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-extrabold py-3 rounded-xl text-xs shadow-md transition"
                >
                  Enter Video Waiting Room
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* STAGE 3: Live Video Call Room */}
      {stage === 'LIVE_CALL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-180">
          
          {/* Main Video Viewport (Col 8) */}
          <div className="lg:col-span-8 bg-slate-950 rounded-3xl overflow-hidden relative flex flex-col justify-between border border-slate-800 shadow-2xl">
            
            {/* Simulated Remote Doctor Video Stream */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1594824813566-88855ce78905?auto=format&fit=crop&q=80&w=1200" 
                alt="Doctor Video Feed" 
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-transparent to-slate-950/40" />
            </div>

            {/* Top Bar overlay */}
            <div className="relative z-10 p-4 flex items-center justify-between text-white">
              <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold">{videoAppointment?.doctorName}</span>
                <span className="text-[10px] text-slate-400">({videoAppointment?.doctorSpecialization})</span>
              </div>
              <span className="text-xs font-mono bg-slate-900/80 px-3 py-1 rounded-xl text-emerald-400 border border-white/10">
                08:42 Call Time
              </span>
            </div>

            {/* Local Patient Video (Picture in Picture) */}
            <div className="absolute bottom-20 right-4 z-10 w-44 h-32 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900">
              {isCamOn ? (
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover transform -scale-x-100" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px] font-bold">
                  Cam Muted
                </div>
              )}
            </div>

            {/* Bottom Call Action Bar */}
            <div className="relative z-10 p-4 bg-slate-900/90 backdrop-blur-md border-t border-white/10 flex items-center justify-center gap-4">
              <button 
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3.5 rounded-2xl transition shadow-md ${isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'}`}
                title="Toggle Mic"
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button 
                onClick={() => setIsCamOn(!isCamOn)}
                className={`p-3.5 rounded-2xl transition shadow-md ${isCamOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'}`}
                title="Toggle Video"
              >
                {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button 
                onClick={() => setStage('POST_CALL')}
                className="bg-rose-600 hover:bg-rose-700 text-white p-3.5 px-6 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-xl transition"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call</span>
              </button>
            </div>

          </div>

          {/* Right Interactive Sidebar (Col 4): Chat / Whiteboard / Rx Preview */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col overflow-hidden">
            
            {/* Tab Headers */}
            <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1 shrink-0">
              <button
                onClick={() => setActiveTab('CHAT')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
                  activeTab === 'CHAT' ? 'bg-white text-[#0F4C81] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>In-Call Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('WHITEBOARD')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
                  activeTab === 'WHITEBOARD' ? 'bg-white text-[#0F4C81] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Whiteboard</span>
              </button>
            </div>

            {/* TAB CONTENT: CHAT */}
            {activeTab === 'CHAT' && (
              <div className="flex flex-col grow overflow-hidden">
                <div className="grow p-4 overflow-y-auto space-y-3">
                  {messages.map((m, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-2xl text-xs space-y-1 max-w-[85%] ${
                        m.sender === 'Patient' 
                          ? 'bg-[#0F4C81] text-white ml-auto rounded-br-none' 
                          : 'bg-slate-100 text-slate-800 mr-auto rounded-bl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-75 font-semibold">
                        <span>{m.sender}</span>
                        <span>{m.time}</span>
                      </div>
                      <p className="font-medium leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-slate-50 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                  />
                  <button 
                    type="submit" 
                    className="bg-[#0F4C81] text-white p-2 rounded-xl hover:bg-[#0A365C] transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT: WHITEBOARD */}
            {activeTab === 'WHITEBOARD' && (
              <div className="p-4 flex flex-col grow space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Interactive Clinical Canvas</span>
                  <button 
                    onClick={clearCanvas} 
                    className="text-[11px] text-rose-600 font-bold hover:underline"
                  >
                    Clear Canvas
                  </button>
                </div>
                <div className="grow bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden relative">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={380}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-full cursor-crosshair bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-center">Draw clinical annotations or symptoms directly.</p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* STAGE 4: Post Call & Download Prescription */}
      {stage === 'POST_CALL' && (
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="font-black text-2xl text-slate-900">Consultation Completed</h3>
            <p className="text-xs text-slate-500 mt-1">Thank you for consulting via SEVASADAN Telemedicine.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
            <p className="font-bold text-slate-800">Prescription Summary Ready</p>
            <p className="text-slate-600">Your doctor has signed and compiled your digital prescription PDF.</p>
          </div>

          <button
            onClick={() => setStage('PRE_TEST')}
            className="w-full bg-[#0F4C81] text-white font-bold py-3 rounded-xl text-xs hover:bg-[#0A365C] transition"
          >
            Return to Room Test
          </button>
        </div>
      )}

    </div>
  );
};
