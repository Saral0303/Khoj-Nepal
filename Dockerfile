FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY khoj-nepal-backend/mvnw .
COPY khoj-nepal-backend/.mvn .mvn
COPY khoj-nepal-backend/pom.xml .

RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY khoj-nepal-backend/src src

RUN ./mvnw clean package -DskipTests -B

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
  CMD wget -q --spider http://localhost:8080/ || exit 1

CMD ["sh", "-c", "java $JAVA_OPTS -jar target/*.jar --server.port=$SERVER_PORT"]
