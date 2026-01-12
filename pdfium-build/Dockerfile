# Dockerfile for building PDFium WASM
# Builds a single WASM module without embedded fonts.
# Fonts are loaded via JS using the FS module at runtime.

FROM ubuntu:22.04

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    python3-pip \
    curl \
    wget \
    xz-utils \
    pkg-config \
    ninja-build \
    lsb-release \
    sudo \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install depot_tools
RUN git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git /opt/depot_tools
ENV PATH="/opt/depot_tools:${PATH}"

# Install Emscripten
WORKDIR /opt
RUN git clone https://github.com/emscripten-core/emsdk.git
WORKDIR /opt/emsdk
RUN ./emsdk install 3.1.51 && \
    ./emsdk activate 3.1.51

# Set up Emscripten environment
ENV EMSDK=/opt/emsdk
ENV PATH="/opt/emsdk:/opt/emsdk/upstream/emscripten:${PATH}"

WORKDIR /build

# Copy build scripts
COPY build.py /build/
COPY config.py /build/

# Output directory
VOLUME ["/output"]

# Entry point
CMD ["python3", "/build/build.py", "--output-dir", "/output"]
