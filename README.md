<div align="center">
  <a href="https://github.com/neusentra">
    <img
      src="https://raw.githubusercontent.com/neusentra/neusentra/main/frontend/public/icons/favicon.svg"
      alt="NeuSentra"
      width='128'
    />
  </a>
</div>

# 🛡️ NeuSentra — Self-Hosted Home Network Guardian

**NeuSentra** is a cutting-edge, self-hosted home network security and management system built around Raspberry Pi.  
It empowers you to take full control of your smart home network with advanced features like DHCP, firewall, ad-blocking, and parental controls — all accessible via an intuitive **web-based dashboard**.

Inspired by Pi-hole but crafted for full network sovereignty, NeuSentra delivers enterprise-grade security and control — yet remains accessible to home users of all skill levels.

---

## 🌟 Key Features

- **Dynamic MAC-Based Device Groups**  
  Organize personal, IoT, kids’ devices into groups to apply customized network and access policies.

- **Flexible Firewall & Parental Controls**  
  IPv4/IPv6 firewall rules per device/group, time-based access restrictions, and granular website filtering.

- **Reliable DHCP Server**  
  Dynamic IP leasing with reserved assignments for known devices.

- **Network-Wide Ad and Tracker Blocking**  
  Block malicious domains and unwanted ads, configurable on a per-group basis.

- **Real-Time Network Monitoring**  
  Watch connected devices and blocked traffic live via Server-Sent Events (SSE).

- **Secure PostgreSQL Storage & Credential Encryption**  
  Database credentials are generated dynamically and encrypted on-device ensuring top-tier security.

- **Modular, Secure System Scripts**  
  Backend-triggered scripts written in Bash and Python manage DHCP, firewall, and ad-block workflows.

- **One-Command Installer Script**  
  Easily deploy NeuSentra with a single, automated Bash script that sets up dependencies, builds source code, and configures services.

---

## 🏗️ System Architecture

```
[ISP Modem] → eth0 → [Raspberry Pi + NeuSentra]
│
eth1 → [Existing Router (AP Mode)] → Connected Devices
```

- **Frontend:** React + Vite + TypeScript for a modern and reactive UI  
- **Backend:** NestJS with REST API and SSE for backend logic and real-time updates  
- **Database:** PostgreSQL (native on Pi, encrypted credentials)  
- **Communication:** REST + SSE  
- **Authentication:** JWT or OAuth2, configurable via the UI

_All critical network and security settings — including IP subnets, firewall rules, and device groups — are configurable exclusively via the web dashboard._

---


## 🔐 Security Highlights

- PostgreSQL credentials are **automatically generated during install and encrypted** for maximum protection.
- Only the NeuSentra backend can decrypt credentials, stored with strict file permissions.
- Scripts and system interactions are sandboxed for security and auditability.

---

## ⚙️ Usage Overview

- **Dashboard**: Manage your entire home network through a unified web UI.  
- **Live Updates**: Real-time monitoring of devices and network activity with SSE.  
- **Automated Scripts**: Backend securely triggers network management scripts for DHCP, firewall, and ad-block updates.

---

## 📌 Planned Future Enhancements

- Full VLAN support, including tagged VLANs for device segmentation (when router hardware supports).  
- VPN server integration for secure remote network access.  
- Granular parental controls with schedules and alert notifications.  
- Backup and restore system configuration.  
- Dockerized deployment option for advanced users.  

---

<!-- ## 📦 Deployment Recommendations

1. **Prepare Raspberry Pi with PostgreSQL and Redis installed.**  
2. **Run installer script to bootstrap system.**  
4. **Optionally configure reverse proxy and HTTPS with Nginx for secure access.**


--- -->

## Resources
- [NeuSentra Backend](https://github.com/neusentra/neusentra-backend/)
- [NeuSentra Frontend](https://github.com/neusentra/neusentra-frontend)

---

## ⚖ License

NeuSentra is open-source and MIT licensed. See [LICENSE](LICENSE) file for terms.  

---

## ❤️ Stay Connected

- Author: NeuSentra  
- Website: [coming soon]  
- X: [coming soon]
- [![Join us on Discord](https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white&style=for-the-badge)](https://discord.gg/3VxzAfW7s6)
