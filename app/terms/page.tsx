"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

export default function TermsPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-gray-900 font-bold text-xl">Commently</span>
          </Link>
          <div className="flex gap-4 items-center">
            {session ? (
              <Link
                href="/dashboard"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-3xl mx-auto px-4 py-12 w-full">
        <article className="prose prose-sm md:prose-base max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Conditions d'utilisation — Commently
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Dernière mise à jour : juin 2025
          </p>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              Commently est un outil en phase bêta. Il est fourni tel quel, sans garantie. Vous utilisez le service à vos propres risques. Nous nous réservons le droit de modifier ou d'interrompre le service à tout moment. En utilisant Commently, vous acceptez de ne pas utiliser l'outil à des fins illégales ou contraires aux conditions d'utilisation de YouTube.
            </p>

            <div>
              <p className="font-semibold text-gray-900">Contact :</p>
              <a
                href="mailto:commently.contact@gmail.com"
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                commently.contact@gmail.com
              </a>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className="text-gray-900 font-bold text-xl">Commently</span>
              <span className="text-gray-500 text-sm">© 2025</span>
            </div>
            <p className="text-gray-500 text-sm">Gère tes commentaires YouTube avec l'IA</p>
          </div>
          <div className="flex gap-6 flex-wrap justify-center md:justify-end">
            <a
              href="mailto:commently.contact@gmail.com"
              className="text-gray-500 hover:text-purple-600 font-medium text-sm transition-colors"
            >
              Contact : commently.contact@gmail.com
            </a>
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-purple-600 font-medium text-sm transition-colors"
            >
              Politique de confidentialité
            </Link>
            <Link
              href="/terms"
              className="text-gray-500 hover:text-purple-600 font-medium text-sm transition-colors"
            >
              Conditions d'utilisation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
