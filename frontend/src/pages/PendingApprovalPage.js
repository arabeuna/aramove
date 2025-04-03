import React from 'react';
import { Link } from 'react-router-dom';

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Cadastro em Análise
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Seu cadastro como motorista está sendo analisado. Em breve entraremos em contato.
          </p>
        </div>

        <div className="mt-4">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
} 