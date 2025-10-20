# Servicio SOAP: getPedidosPorEmail

## Descripción
Consulta los pedidos asociados a un usuario utilizando su email.

## Endpoint
- **WSDL:** `http://localhost:8001/wsdl`
- **Servicio:** `PedidoService`
- **Método:** `getPedidosPorEmail`

## Parámetros

| Nombre   | Tipo   | Descripción                | Obligatorio |
|----------|--------|----------------------------|-------------|
| email    | string | Email del usuario/cliente  | Sí          |

## Respuesta

- **pedidos**: Array de objetos pedido.
  - Cada objeto puede incluir: id, estado, fecha, total, etc. (según tu modelo de datos).

## Ejemplo de Request (SOAP XML)
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:tn="http://tn-api/soap">
   <soapenv:Header/>
   <soapenv:Body>
      <tn:getPedidosPorEmail>
         <email>usuario@email.com</email>
      </tn:getPedidosPorEmail>
   </soapenv:Body>
</soapenv:Envelope>
```

### Ejemplo de Respuesta (SOAP XML)
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
   <soapenv:Body>
      <getPedidosPorEmailResponse>
         <pedidos>
            <pedido>
               <id>1</id>
               <estado>Pendiente</estado>
               <fecha>2025-10-20</fecha>
               <total>1500.00</total>
            </pedido>
            <pedido>
               <id>2</id>
               <estado>Entregado</estado>
               <fecha>2025-09-15</fecha>
               <total>2300.00</total>
            </pedido>
         </pedidos>
      </getPedidosPorEmailResponse>
   </soapenv:Body>
</soapenv:Envelope>
```

---

## Notas
- El método espera un parámetro `email` y devuelve los pedidos asociados a ese usuario.
- Si el email no existe, la respuesta será una lista vacía.
