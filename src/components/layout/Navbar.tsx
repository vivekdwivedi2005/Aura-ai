import { Bot } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
                <div className="flex items-center gap-3">
                    <Bot className="h-8 w-8 text-violet-400" />
                    <span className="text-2xl font-bold text-white">
                        AURA <span className="text-violet-400">AI</span>
                    </span>
                </div>

                <div className="hidden gap-8 text-gray-300 md:flex">
                    <a href="#" className="transition-all duration-300 hover:text-violet-400 hover:scale-105">Home</a>
                    <a href="#" className="transition-all duration-300 hover:text-violet-400 hover:scale-105">Features</a>
                    <a href="#" className="transition-all duration-300 hover:text-violet-400 hover:scale-105">Pricing</a>
                    <a href="#" className="transition-all duration-300 hover:text-violet-400 hover:scale-105">Docs</a>
                </div>

                <Link to="/login">
                    <button className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105">
                        Login
                    </button>
                </Link>

            </div>
        </nav>
    );
}

export default Navbar;