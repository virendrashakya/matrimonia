module.exports = {
    apps: [{
        name: "matrimonia-api",
        script: "./src/app.js",
        instances: "max",
        exec_mode: "cluster",
        watch: false,
        max_memory_restart: '500M',
        env: {
            NODE_ENV: "development"
        },
        env_production: {
            NODE_ENV: "production",
            PORT: 5000
        }
    }]
}
