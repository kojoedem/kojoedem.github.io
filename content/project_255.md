# Project 255 — Dual-Site Network Design (CML)

**Project 255** is a small enterprise network design built using **Cisco Modeling Labs (CML)** to simulate a real-world multi-site company network with redundancy and centralized internet access.

The project connects two company locations:

- **Accra (Headquarters)** — Acts as the main internet gateway with dual ISP links (Fiber and Microwave).
- **Tamale (Branch Site)** — Hosts the company’s server farm and accesses the internet through the Accra headquarters.

Both sites are interconnected through an ISP network, allowing secure resource sharing while maintaining high availability through redundant WAN links. The design demonstrates practical enterprise concepts such as site-to-site connectivity, failover planning, and centralized traffic routing.

This lab focuses on building a resilient architecture where:

- Accra users can access servers hosted in Tamale
- Tamale servers reach the internet via Accra
- Network services remain available even if a WAN link fails

👉 **View the full topology, configurations, and implementation details on GitHub:**  
[Project 255 – Full Documentation](https://github.com/kojoedem/project-255/tree/main)

---

*Platform:* Cisco Modeling Labs (CML)  
*Category:* Enterprise Network Design | Networking Lab | Cisco Simulation