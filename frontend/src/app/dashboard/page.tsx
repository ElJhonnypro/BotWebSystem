"use client"
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import style from "./dashboard.module.css";
import FloatingMessage from "@/components/floatingMessage";

export default function Dashboard() {
  const router = useRouter();
  const [guilds, setGuilds] = useState([]);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [MessageShow, setMessage] = useState<string>("");
  
  useEffect(() => {
    axios
      .get("/apibot/auth/guilds", { withCredentials: true })
      .then((guildRes) => {
        const inviteableGuilds = guildRes.data.filter((guild: any) => 
          (parseInt(guild.permissions_new) & 0x20) !== 0 // Permiso de Administrar Servidor
        );
        setGuilds(inviteableGuilds);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleApply = (guildId: string, prefix: string, message: string) => {
    axios.put("/apibot/settings/applyPrefix", {
      prefix: prefix,
      guildid: guildId,
    }, { withCredentials: true })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
        if( err.status === 403) 
          {
            alert("You need to be an administrator to apply settings.");
          }
      });

      axios.put("/apibot/settings/applyMessage", {
        guildid: guildId,
        message: message,
      }, {withCredentials: true}).then((res) => {
        setShowMessage(true);
        setMessage("Settings applied successfully! Wait 5 minutes to see changes.");
        setTimeout(() => {
          setShowMessage(false);
        }, 3000);

      }).catch((err) => {
        if( err.status === 403) 
        {
          alert("You need to be an administrator to apply settings.");
        }
      });
  };

  const handleOpen = (guildId: string) => {
    const formGuild = document.querySelector(`div[id="${guildId}"]`);
    const formGuildButton = document.querySelector(`button[id="button-${guildId}"] span`);
    if (!formGuild || !formGuildButton) return;

    if (formGuild.classList.contains(style.open)) {
      formGuild.classList.remove(style.open);
      formGuild.classList.add(style.closed);
      formGuildButton.textContent = "Open";
    } else {
      formGuild.classList.add(style.open);
      formGuild.classList.remove(style.closed);
      formGuildButton.textContent = "Close";
    }
  };

  return (
    <div>
      <main>
        <h2>Dashboard</h2>
        <p>Welcome to the dashboard page</p>
      </main>
      <h3>Your Servers:</h3>
      <div className={style.serversContainer}>
        <ul className={style.serversList}>
          {guilds.length > 0 ? (
            guilds.map((guild: any) => (
              <li className={style.serversObject} key={guild.id}>
                {guild.name}
                <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" id={`button-${guild.id}`} onClick={() => handleOpen(guild.id)}>
                  <span>Open</span>
                </button>
                <div id={guild.id} className={style.closed+" control configuration"}>
                  <input type="text" id={`prefix-${guild.id}`} placeholder="Prefix" />
                  <br />
                  <input type="text" id={`ip-${guild.id}`} placeholder="Message" />
                  <br />
                  <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={() => 
                    handleApply(
                      guild.id, 
                      (document.getElementById(`prefix-${guild.id}`) as HTMLInputElement).value,
                      (document.getElementById(`ip-${guild.id}`) as HTMLInputElement).value
                    )}>
                      <span>Apply</span>
                    
                  </button>
                  <a className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" href="https://discord.com/oauth2/authorize?client_id=1356007992457433209&permissions=1719629677194487&integration_type=0&scope=bot">
                      <span>Invite bot</span>
                    
                  </a>
                </div>
              </li>
            ))
          ) : (
            <p>Loading servers...</p>
          )}
          {showMessage ? 
          (
            <FloatingMessage message={MessageShow} duration={3000} />
          )
          :
          (
            null
          )}
        </ul>
      </div>
      <button onClick={() => router.push("http://localhost:4765/auth/logout")}>
        Log out
      </button>
    </div>
  );
}
