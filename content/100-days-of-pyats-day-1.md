# 100 Days of pyATS: Day 1 - The Journey Begins!

Welcome to Day 1 of my **100 Days of pyATS** challenge! 🚀

As a Network Engineer and Automation Developer, I have always searched for ways to make network testing, verification, and profiling more efficient and robust. Today, I am officially embarking on a 100-day journey to master **pyATS** (Python Automated Test System), Cisco's powerful test automation framework.

In this blog series, I will document my daily progress, learnings, challenges, and code snippets as I explore this amazing tool.

---

## What is pyATS?

**pyATS** is an end-to-end testing ecosystem and framework developed by Cisco. Originally built for internal Cisco engineering teams, it is now open-source and widely used by network operators and automation engineers worldwide.

### Key Components of pyATS:
1. **pyATS**: The core test framework that handles execution, logging, and reporting.
2. **Genie**: The library component of pyATS that contains reusable network state parsers, triggers, and verification libraries. Think of Genie as the "brain" that knows how to parse complex router outputs (like `show ip interface brief`) into clean, structured Python dictionaries.

---

## Why pyATS for Network Automation?

If you have done network automation with tools like Netmiko or Paramiko, you know that handling unstructured CLI output is one of the biggest headaches. You often have to write complex regular expressions (regex) to extract IP addresses, interface statuses, or routing table entries.

pyATS completely solves this by:
- **Parsing** CLI output into JSON/Python dictionaries automatically using robust, community-maintained parsers.
- **Profiling** networks to compare before-and-after states during maintenance windows.
- **Testing and Verifying** network states using clean, structured test cases.

---

## My Goals for the Next 100 Days

Over the next 100 days, I plan to:
- Learn how to connect to various network devices (Cisco, Juniper, Arista, etc.) using pyATS testbeds.
- Master pyATS/Genie parsers to extract structured network data.
- Write robust network verification test suites.
- Perform "diffs" on network states to verify changes automatically.
- Integrate pyATS into modern CI/CD pipelines.

---

## Day 1 Setup & Installation

To kick things off, I set up my Python virtual environment and installed pyATS:

```bash
# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install pyATS with Genie libraries
pip install "pyats[full]"
```

Once installed, we can quickly verify the installation using the CLI:
```bash
pyats version
```

---

## Reflection

I am incredibly excited about this challenge. Network testing and verification shouldn't be a tedious manual process of typing `show` commands and hoping for the best. With pyATS, we can treat our network state as code.

Stay tuned for Day 2, where we will dive into creating our first **pyATS Testbed file** to model our network topology!

*“It's never too late to learn, just start today.”*
