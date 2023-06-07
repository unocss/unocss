FROM node:18

# Set working directory
WORKDIR /app

# Copy application code to container
COPY . /app

# prepare for Codesandbox
CMD ["node", ".codesandbox.mjs"]

CMD ["npm", "install"]
CMD ["npm", "run", "dev"]
