import { Video, Users, ShieldCheck, Globe } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export function Landing() {
    const navigate = useNavigate();
    return (
        <div className="w-full bg-gray-950 text-white font-sans">
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-5 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <Video className="w-8 h-8 text-blue-500" />
                    <span className="text-xl font-bold tracking-wide">StreamConnect</span>
                </div>
                <div className="flex gap-4">
                    <button className="text-gray-400 hover:text-white transition">Login</button>
                    <button className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full font-medium transition">
                        Sign Up
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="container mx-auto px-6 py-20 text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                    Connect with the World, <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">
                        Securely & Instantly.
                    </span>
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                    Experience random 1-to-1 video chats or host massive broadcast rooms.
                    Powered by AI moderation for a safe and clean environment.
                </p>

                <div className="flex flex-col md:flex-row justify-center gap-5">
                    <button
                        onClick={() => navigate("/video-call")}
                        className="flex items-center justify-center gap-2 bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-red-500/30 transition transform hover:scale-105 animate-pulse">
                        <Video className="w-6 h-6" />
                        Start Random Video Call
                    </button>

                    {/* Create Broadcast Room Button */}
                    <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition transform hover:scale-105">
                        <Users className="w-5 h-5" />
                        Create Broadcast Room
                    </button>
                </div>
            </header>

            {/* Features Section */}
            <section className="bg-gray-900 py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Choose StreamConnect?</h2>
                        <p className="text-gray-400">Advanced features designed for connection and safety.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-blue-500 transition duration-300">
                            <div className="bg-blue-500/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                                <Globe className="w-7 h-7 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Random 1-to-1 Matching</h3>
                            <p className="text-gray-400">
                                Our smart algorithm matches you with strangers instantly. Private, encrypted, and fast peer-to-peer connection.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-purple-500 transition duration-300">
                            <div className="bg-purple-500/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                                <Users className="w-7 h-7 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">One-to-Many Broadcast</h3>
                            <p className="text-gray-400">
                                Host a room where you are the speaker. Thousands can join, watch, and chat via text while remaining muted.
                            </p>
                        </div>

                        {/* Feature 3 (Safety) */}
                        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-red-500 transition duration-300">
                            <div className="bg-red-500/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                                <ShieldCheck className="w-7 h-7 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">AI Content Moderation</h3>
                            <p className="text-gray-400">
                                Real-time AI monitoring detects explicit content instantly and blurs the video stream to ensure a safe community.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 container mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                    {[
                        { step: "1", title: "Choose Mode", desc: "Select Random Chat or Broadcast." },
                        { step: "2", title: "Get Matched", desc: "Connect instantly via Socket.IO." },
                        { step: "3", title: "Safe Streaming", desc: "AI filters ensure clean content." },
                        { step: "4", title: "Interact", desc: "Chat, talk, and make friends." }
                    ].map((item, index) => (
                        <div key={index} className="relative p-6">
                            <span className="text-6xl font-bold text-gray-800 absolute top-0 left-1/2 -translate-x-1/2 -z-10 opacity-50">
                                {item.step}
                            </span>
                            <h4 className="text-lg font-bold mt-4">{item.title}</h4>
                            <p className="text-gray-400 text-sm mt-2">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black py-8 text-center text-gray-500 text-sm border-t border-gray-900">
                <p>&copy; 2024 StreamConnect. All rights reserved.</p>
                <div className="flex justify-center gap-4 mt-4">
                    <a href="#" className="hover:text-white">Privacy Policy</a>
                    <a href="#" className="hover:text-white">Terms of Service</a>
                    <a href="#" className="hover:text-white">Community Guidelines</a>
                </div>
            </footer>
        </div>
    );
};