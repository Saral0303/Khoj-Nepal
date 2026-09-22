FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY khoj-nepal-backend/mvnw .
COPY khoj-nepal-backend/.mvn .mvn
COPY khoj-nepal-backend/pom.xml .

RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY khoj-nepal-backend/src src

RUN ./mvnw clean package -DskipTests -B

EXPOSE 8080

CMD ["sh", "-c", "java -jar target/*.jar"]
