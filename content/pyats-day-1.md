# Day 1: Getting Started with pyATS

Today marks the beginning of my **100 Days of pyATS** journey! Over the next 100 days, I will be deep-diving into pyATS (Python Automated Test System), Cisco's powerful test automation framework.

## Why pyATS?
pyATS is not just for Cisco devices; it's a multi-vendor network automation and testing framework. It allows engineers to:
- Parse device outputs into structured JSON.
- Verify network states before and after changes.
- Build robust, reusable test suites.

## My First Script
Here is a basic snippet showing how we can connect to a device and gather basic information:

```python
from genie.testbed import load

# Load testbed
testbed = load('testbed.yaml')

# Find device and connect
dev = testbed.devices['router-1']
dev.connect()

# Parse 'show version' command
output = dev.parse('show version')
print(f"Software Version: {output['version']['os']}")
```

Stay tuned for Day 2!
