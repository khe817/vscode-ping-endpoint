# ping-endpoint README

This extension shows ping result in the status bar, and shows if the endpoint is online or offline.

Personally, I use this as an indicator for Spring Boot project compile result; instead of having to watch the build output every time.

## Features

The extension shows the ping and if the configured endpoint is online and responsive (`curl` result: `HTTP/1.1 200|HTTP/2 200`).

![No network](https://raw.githubusercontent.com/khe817/vscode-ping-endpoint/master/no-network.PNG)

![Online](https://raw.githubusercontent.com/khe817/vscode-ping-endpoint/master/online.PNG)

To start it, run command: `F1` > `Ping endpoint: Start`

To stop it, run command: `F1` > `Ping endpoint: Stop`

## Supported platforms
Linux, Windows, Windows Subsystem for Linux (WSL)

**Notes:** This extension runs ping commands in the default integrated terminal. For Git Bash on Windows (MINGW) and Windows (cmd) shells, `netcat` is required installed for it to work.

## Extension Settings

This extension contributes the following settings:

* `ping-endpoint.hostname`: Hostname to ping (required, default: `localhost`)
* `ping-endpoint.port`: Port to ping (required, default: `80`)
* `ping-endpoint.endpoint`: Endpoint for health check (default: `/`)
* `ping-endpoint.healthCheck.enabled`: Send curl to hit endpoint for success HTTP status, one time event after ping success. (default: `true`)
* `ping-endpoint.healthCheck.ssl`: Curl use secured connection (`HTTPS`)?. (default: `false`)
* `ping-endpoint.healthCheck.includePort`: Curl include port? (default: `true`)

#### Example setting:
```json
{
    "ping-endpoint.hostname": "en.wikipedia.org",
    "ping-endpoint.port": 80,
    "ping-endpoint.endpoint": "/wiki/Main_Page",
    "ping-endpoint.healthCheck.enabled": true,
    "ping-endpoint.healthCheck.ssl": true,
    "ping-endpoint.healthCheck.includePort": false,
}
```
