# 🧠 CPU Scheduling Simulator

A **CPU Scheduling Simulator** that demonstrates classical scheduling algorithms along with **advanced extensions like multicore scheduling, execution tracing**.

This project is built as a **simulation-based system** to understand how different cpu scheduling algorithms affect process execution and user experience.

---

## 📌 Project Overview

This simulator allows users to:
- Create processes with different parameters
- Apply multiple CPU scheduling algorithms
- Visualize execution using **Gantt charts**
- Observe how scheduling decisions change under different workloads

In addition to traditional schedulers, the system includes a **Cognitive Load–Aware Scheduler** that adapts scheduling behavior based on simulated user workload patterns.

---

## 🎥 Project Demonstration

The project video demonstrates:
- Selection of scheduling algorithms
- Process execution across CPU cores
- Dynamic scheduling decisions
- Execution logs and visual output


---

## ⚙️ Features Demonstrated

### 🔹 Classical Scheduling Algorithms
- First Come First Serve (FCFS)
- Shortest Job First (SJF)
- Shortest Remaining Time First(SRTF)
- Priority Scheduling(Premptive and Non Preemptive)
- Priority(Aging)
- Round Robin (RR)

Each algorithm produces:
- Process execution order
- Waiting time and turnaround time of each Process
- Gantt chart visualization
- Average Waiting time and turnaround time.

---

### 🔹 Multicore CPU Scheduling
- Simulates multiple CPU cores
- Processes are distributed across cores
- Reduces idle time and improves throughput
- Core-wise execution is visible in output

---


---

### 🔹 Process Execution Log
- Step-by-step log of scheduling decisions
- Includes:
  - Process start time
  - Core assignment
  - Quantum adjustments
- Makes scheduler behavior transparent and explainable

---

---

## 🧩 System Workflow
Process Input
↓
Scheduler Selection
↓
(Traditional / Cognitive Scheduler)
↓
Multicore CPU Simulation
↓
Execution Logs + Gantt Chart


---

## 🛠️ Tech Stack

- **Language:** Python  
- **Scheduling Engine:** Custom simulation logic  
- **Visualization:** Gantt chart generation  
- **ML Component:** Lightweight model for cognitive load prediction  
- **Interface:** Command-line based  
- **Version Control:** Git & GitHub  

---

## 🚀 How to Run

```bash
git clone https://github.com/amritsharan/cpu-scheduling-simulator.git
npm install
npm run dev

📊What This Project Demonstrates
Clear understanding of CPU scheduling fundamentals
Ability to simulate multicore execution
Practical comparison of scheduling strategies
Exploration of human-centric system design

🎯 Learning Outcomes
Deepened understanding of OS scheduling algorithms
Hands-on experience with multicore scheduling
Exposure to adaptive and human-aware system design
Improved ability to explain system behavior using logs and visuals.

Made with ❤️ by Amrit







