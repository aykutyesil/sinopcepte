# syntax=docker/dockerfile:1
# --- 1. aşama: Maven ile derle ---
FROM maven:3.9.11-eclipse-temurin-17 AS build
WORKDIR /src
# Bağımlılıkları ayrı katmanda indir (pom değişmedikçe önbellekten gelir)
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
# Testler Testcontainers (Docker) ister; imaj içinde değil, CI/yerelde `./mvnw verify` ile koşulur.
RUN mvn -q -B -DskipTests package \
 && cp target/backend-*.jar /src/app.jar

# --- 2. aşama: yalnız JRE ---
FROM eclipse-temurin:17-jre
ENV TZ=Europe/Istanbul \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -Duser.timezone=Europe/Istanbul"
RUN groupadd --system app && useradd --system --gid app --no-create-home app
WORKDIR /app
COPY --from=build /src/app.jar /app/app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
