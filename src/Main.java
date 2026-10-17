
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

public class Main {

    public static void main(String[] args) throws IOException {

        HttpServer server = HttpServer.create(
                new InetSocketAddress(8080), 0);

        server.createContext("/", exchange -> {
            String path = exchange.getRequestURI().getPath();

            if (path.equals("/")) {
                sendFile(exchange, "public/index.html", "text/html");
            } else if (path.equals("/style.css")) {
                sendFile(exchange, "public/style.css", "text/css");
            } else if (path.equals("/calculate")) {
                calculatePower(exchange);
            } else {
                sendResponse(exchange, 404, "Page not found");
            }
        });

        server.start();

        System.out.println("PhysicsHub is running!");
        System.out.println("Open http://localhost:8080");
    }

    private static void sendFile(
            HttpExchange exchange,
            String filename,
            String contentType) throws IOException {

        Path file = Path.of(filename);

        if (!Files.exists(file)) {
            sendResponse(exchange, 404, "File not found: " + filename);
            return;
        }

        byte[] content = Files.readAllBytes(file);

        exchange.getResponseHeaders().set(
                "Content-Type", contentType + "; charset=UTF-8");

        exchange.sendResponseHeaders(200, content.length);

        try (OutputStream output = exchange.getResponseBody()) {
            output.write(content);
        }
    }

    private static void calculatePower(
            HttpExchange exchange) throws IOException {

        if (!exchange.getRequestMethod().equals("POST")) {
            exchange.getResponseHeaders().set("Allow", "POST");
            sendResponse(exchange, 405,
                    "Please submit the calculator form.");
            return;
        }

        String body = new String(
                exchange.getRequestBody().readAllBytes(),
                StandardCharsets.UTF_8);

        Map<String, String> values = new HashMap<>();

        for (String parameter : body.split("&")) {
            String[] parts = parameter.split("=", 2);

            if (parts.length == 2) {
                String key = URLDecoder.decode(
                        parts[0], StandardCharsets.UTF_8);

                String value = URLDecoder.decode(
                        parts[1], StandardCharsets.UTF_8);

                values.put(key, value);
            }
        }

        try {
            double voltage = Double.parseDouble(
                    values.get("voltage"));

            double current = Double.parseDouble(
                    values.get("current"));

            if (!Double.isFinite(voltage)
                    || !Double.isFinite(current)
                    || voltage < 0 || current < 0) {
                throw new IllegalArgumentException();
            }

            double power = voltage * current;

            String html = """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport"
                              content="width=device-width, initial-scale=1.0">
                        <title>Calculation Result</title>
                        <link rel="stylesheet" href="/style.css">
                    </head>
                    <body>
                        <main class="container">
                            <section class="calculator">
                                <p class="tag">YOUR RESULT</p>
                                <h2>Electrical Power</h2>
                                <p>Voltage: %s V</p>
                                <p>Current: %s A</p>
                                <div class="formula">
                                    Power = %s Watts
                                </div>
                                <p>Formula: P = V × I</p>
                                <br>
                                <a class="btn" href="/">
                                    Back to Home
                                </a>
                            </section>
                        </main>
                    </body>
                    </html>
                    """.formatted(voltage, current, power);

            sendHtml(exchange, 200, html);

        } catch (RuntimeException e) {
            sendHtml(exchange, 400, """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>Invalid Input</title>
                        <link rel="stylesheet" href="/style.css">
                    </head>
                    <body>
                        <main class="container">
                            <section class="calculator">
                                <h2>Invalid input</h2>
                                <p>Please enter valid, non-negative
                                   voltage and current values.</p>
                                <a class="btn" href="/">Try Again</a>
                            </section>
                        </main>
                    </body>
                    </html>
                    """);
        }
    }

    private static void sendHtml(
            HttpExchange exchange,
            int status,
            String html) throws IOException {

        byte[] content = html.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set(
                "Content-Type", "text/html; charset=UTF-8");

        exchange.sendResponseHeaders(status, content.length);

        try (OutputStream output = exchange.getResponseBody()) {
            output.write(content);
        }
    }

    private static void sendResponse(
            HttpExchange exchange,
            int status,
            String message) throws IOException {

        byte[] content = message.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set(
                "Content-Type", "text/plain; charset=UTF-8");

        exchange.sendResponseHeaders(status, content.length);

        try (OutputStream output = exchange.getResponseBody()) {
            output.write(content);
        }
    }
}
