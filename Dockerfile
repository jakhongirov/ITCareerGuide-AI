# ============================================================
#  ITCareerGuide AI — Dockerfile
#  Static web app served via Nginx (no Node.js runtime needed)
#  Build: docker build -t itcareerguide-ai .
#  Run:   docker run -p 8080:80 itcareerguide-ai
# ============================================================

# ── Stage 1: Use lightweight Nginx to serve static files ────
FROM nginx:1.27-alpine

# Set a clear label for the image
LABEL maintainer="ITCareerGuide AI Team"
LABEL description="ITCareerGuide AI — Smart Career Guidance for IT Students"
LABEL version="1.0.0"

# Remove the default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy the entire project into the Nginx web root
COPY . /usr/share/nginx/html/

# Copy our custom Nginx config (for proper SPA routing & caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (standard HTTP)
EXPOSE 80

# Nginx runs as the foreground process
CMD ["nginx", "-g", "daemon off;"]
