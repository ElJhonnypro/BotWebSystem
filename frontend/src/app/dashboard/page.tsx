"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import style from "./dashboard.module.css";

interface Guild {
  id: string;
  name: string;
  permissions_new: string;
}

interface FormData {
  [key: string]: {
    prefix: string;
    message: string;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [formData, setFormData] = useState<FormData>({});

  const handle = () => {
    router.push("http://localhost:4765/auth/logout");
  };

  useEffect(() => {
    axios
      .get("/apibot/auth/guilds", { withCredentials: true })
      .then((guildRes) => {
        const canBotGuilds = guildRes.data.filter((guild: Guild) => (parseInt(guild.permissions_new) & 0x20) !== 0);
        setGuilds(canBotGuilds);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleApply = (guildId: string) => {
    const ClientPrefix = formData[guildId]?.prefix;
    const Message = formData[guildId]?.message;

    if (ClientPrefix && Message) {
      axios
        .put(`/apibot/settings/applyPrefix`, {
          prefix: ClientPrefix,
          guildid: guildId,
        })
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
        axios
        .put(`/apibot/settings/applyMessage`, {
          message: Message,
          guildid: guildId,
        })
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const handleInputChange = (guildId: string, field: "prefix" | "message") => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      [guildId]: {
        ...prevData[guildId],
        [field]: value,
      },
    }));
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
            guilds.map((guild) => (
              <li className={style.serversObject} key={guild.id}>
                {guild.name}
                <div className="control configuration">
                  <input
                    type="text"
                    placeholder="Prefix"
                    value={formData[guild.id]?.prefix || ""}
                    onChange={handleInputChange(guild.id, "prefix")}
                  />
                  <br />
                  <input
                    type="text"
                    placeholder="Text of !hello"
                    value={formData[guild.id]?.message || ""}
                    onChange={handleInputChange(guild.id, "message")}
                  />
                  <br />
                  <button
                    onClick={() => handleApply(guild.id)}
                    className="relative outline-3 outline-emerald-500 inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-transparent hover:bg-gradient-to-br hover:from-teal-300 hover:to-lime-300 focus:bg-gradient-to-br focus:from-teal-300 focus:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800"
                  >
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-transparent dark:bg-transparent rounded-md">
                      Apply
                    </span>
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p>Loading servers...</p>
          )}
        </ul>
      </div>

      <button onClick={handle}>Log out</button>
    </div>
  );
}
