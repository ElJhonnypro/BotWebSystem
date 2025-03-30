"use client"
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home(){
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    axios
      .get("/apibot/auth/guilds", {
        withCredentials: true, // Agregar las cookies al encabezado de la solicitud
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": '*',
        },
      }) // Hacer la solicitud con las cookies
      .then((guildres) => {
        setIsAuthenticated(true);
        console.log(guildres)
        router.push("/dashboard"); // Redirigir a la página del dashboard si está autenticado
      })
      .catch((err) => {
        setIsAuthenticated(false); // Si hay un error (no está autenticado), mantener en el estado
      })
      .finally(() => {
        setLoading(false); // Finalizar el estado de carga
      });
  }, []);

  const butloginclick = () => {
    router.push(
      "https://discord.com/api/oauth2/authorize?client_id=1354979490098446507&redirect_uri=http://localhost:4765/auth/verify&response_type=code&scope=identify%20guilds"
    );
  };

  if (loading) {
    return <div>Loading...</div>; // Mostrar un cargador mientras verificamos la autenticación
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <main className="configuration">
        {!isAuthenticated && (
          <button
            onClick={butloginclick}
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              Login with Discord
            </span>
          </button>
        )}
      </main>
    </div>
  );
};
