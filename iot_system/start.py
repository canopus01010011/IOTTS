"""
Run both services in one Railway deployment:
  - HTTP route API (for backend / mobile map)
  - GPS MQTT simulator (optional — needs BROKER_HOST / BROKER_PORT)
"""
import os
import subprocess
import sys
import time


def main() -> None:
    port = os.getenv("PORT", "8001")
    routes_only = os.getenv("IOT_ROUTES_ONLY", "").lower() in ("1", "true", "yes")
    sim_only = os.getenv("IOT_SIMULATOR_ONLY", "").lower() in ("1", "true", "yes")
    # Default: routes API only. Set IOT_RUN_SIMULATOR=true to enable MQTT GPS.
    run_simulator = os.getenv("IOT_RUN_SIMULATOR", "false").lower() in (
        "1",
        "true",
        "yes",
    )

    procs: list[tuple[str, subprocess.Popen]] = []
    simulator_proc: subprocess.Popen | None = None

    if not sim_only:
        print(f"Starting route API on port {port}...")
        api_proc = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "route_server:app",
                "--host",
                "0.0.0.0",
                "--port",
                port,
            ],
        )
        procs.append(("routes-api", api_proc))

    if not routes_only and run_simulator:
        print("Starting GPS simulator...")
        simulator_proc = subprocess.Popen(
            [sys.executable, "gps_simulator.py", "--listen"],
        )
        procs.append(("gps-simulator", simulator_proc))
    elif not routes_only:
        print("GPS simulator disabled (IOT_RUN_SIMULATOR=false).")

    if not procs:
        print("Nothing to run.")
        sys.exit(1)

    try:
        while True:
            for name, proc in list(procs):
                if proc.poll() is not None:
                    code = proc.returncode or 1
                    if name == "routes-api":
                        print(f"{name} exited with code {code}")
                        raise SystemExit(code)
                    print(
                        f"Warning: {name} exited with code {code}. "
                        "Route API keeps running.",
                    )
                    procs.remove((name, proc))
                    simulator_proc = None
            time.sleep(2)
    except KeyboardInterrupt:
        for _, proc in procs:
            proc.terminate()


if __name__ == "__main__":
    main()
