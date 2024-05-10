module.exports = {
  apps: [
    {
      name: "mexc_server",
      script: "./xcoin.js",
      cron_restart: "50 */6 * * *",
      restart_delay: 100,
      args: "server mexc --conf ./data/config/mexc/mexc-test-paper.json",
    },
    {
      name: "MEXC Test PAPER",
      script: "./xcoin.js",
      watch: ["./data/pm2/restart_mexc_mexc-test-paper.json"],
      args: "trade mexc --conf ./data/config/mexc/mexc-test-paper.json --with_server",
    },
  ],
};
