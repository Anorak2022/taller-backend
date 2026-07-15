-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "aceiteId" TEXT,
ADD COLUMN     "cantidadAceite" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Aceite" (
    "id" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "viscosidad" TEXT NOT NULL,
    "tipoEnvase" TEXT NOT NULL,
    "stockActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stockMinimo" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "precioCompra" DOUBLE PRECISION,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aceite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoInventario" (
    "id" TEXT NOT NULL,
    "aceiteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "razon" TEXT NOT NULL,
    "referencia" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoInventario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_aceiteId_fkey" FOREIGN KEY ("aceiteId") REFERENCES "Aceite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInventario" ADD CONSTRAINT "MovimientoInventario_aceiteId_fkey" FOREIGN KEY ("aceiteId") REFERENCES "Aceite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
