"use client";

import { useEffect, useMemo, useState } from "react";
import { GeoJSON } from "react-leaflet";

import type {
  Path,
  Layer,
  LeafletEvent,
} from "leaflet";

interface WardProperties {
  Ward_Name?: string;
  Ward_No?: string;

  ward?: string;
  number?: number;
  name?: string;
  zone?: string;
}

interface WardFeature {
  type: "Feature";
  properties?: WardProperties;
  geometry: unknown;
}

interface WardGeoJSON {
  type: "FeatureCollection";
  features: WardFeature[];
}

interface WardMetric {
  ward: string;
  complaintCount: number;
  highPriority: number;
  resolved: number;
  activeWorkers: number;
}

interface WardLayerProps {
  metrics: WardMetric[];
  onSelect: (ward: WardMetric) => void;
}

/* -----------------------------------------
   NORMALIZE WARD NAME
----------------------------------------- */

function normalizeWard(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/* -----------------------------------------
   GET WARD NAME
----------------------------------------- */

function getWardName(
  properties: WardProperties | undefined
) {
  if (!properties) {
    return "";
  }

  return (
    properties.Ward_Name ||
    properties.ward ||
    properties.name ||
    (properties.Ward_No
      ? `Ward ${properties.Ward_No}`
      : properties.number !== undefined
      ? `Ward ${properties.number}`
      : "")
  );
}

/* -----------------------------------------
   GET WARD NUMBER
----------------------------------------- */

function getWardNumber(
  properties: WardProperties | undefined
) {
  if (!properties) {
    return "";
  }

  return (
    properties.Ward_No ||
    (properties.number !== undefined
      ? String(properties.number)
      : "")
  );
}

/* -----------------------------------------
   FIND API METRIC FOR WARD
----------------------------------------- */

function getWardMetric(
  properties: WardProperties | undefined,
  metrics: WardMetric[]
) {
  const wardName = getWardName(properties);
  const wardNumber = getWardNumber(properties);

  if (!wardName && !wardNumber) {
    return undefined;
  }

  const normalizedName =
    normalizeWard(wardName);

  return metrics.find((item) => {
    const metricWard =
      normalizeWard(item.ward);

    /*
     * PRIMARY MATCH
     *
     * GeoJSON:
     * Ward_Name = "TUKHMIR PUR"
     *
     * API:
     * ward = "TUKHMIR PUR"
     */
    if (
      normalizedName &&
      metricWard === normalizedName
    ) {
      return true;
    }

    /*
     * SECONDARY MATCH
     *
     * GeoJSON:
     * Ward_No = "270"
     *
     * API:
     * ward = "Ward 270"
     */
    if (wardNumber) {
      const metricNumber =
        metricWard
          .replace(/^ward\s*/i, "")
          .trim();

      if (
        metricNumber === wardNumber
      ) {
        return true;
      }
    }

    return false;
  });
}

/* -----------------------------------------
   COMPLAINT INTENSITY
----------------------------------------- */

function getIntensity(
  complaintCount: number,
  maxComplaints: number
) {
  if (maxComplaints <= 0) {
    return 0.15;
  }

  return Math.max(
    0.15,
    Math.min(
      0.85,
      complaintCount / maxComplaints
    )
  );
}

/* -----------------------------------------
   MAIN COMPONENT
----------------------------------------- */

export default function WardLayer({
  metrics,
  onSelect,
}: WardLayerProps) {
  const [geojson, setGeojson] =
    useState<WardGeoJSON | null>(null);

  const [selectedWard, setSelectedWard] =
    useState<WardMetric | null>(null);

  /* -----------------------------------------
     LOAD DELHI WARD GEOJSON
  ----------------------------------------- */

  useEffect(() => {
    fetch("/gis/delhi-wards.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Ward GeoJSON not found"
          );
        }

        return response.json();
      })
      .then((data: WardGeoJSON) => {
        setGeojson(data);
      })
      .catch((error) => {
        console.error(
          "WARD_GEOJSON_ERROR:",
          error
        );
      });
  }, []);

  /* -----------------------------------------
     FIND MAX COMPLAINT COUNT
  ----------------------------------------- */

  const maxComplaints = useMemo(() => {
    return Math.max(
      1,
      ...metrics.map(
        (item) => item.complaintCount
      )
    );
  }, [metrics]);

  /* -----------------------------------------
     WAIT FOR GEOJSON
  ----------------------------------------- */

  if (!geojson) {
    return null;
  }

  /* -----------------------------------------
     GEOJSON LAYER
  ----------------------------------------- */

  return (
    <GeoJSON
      key={JSON.stringify(metrics)}
      data={geojson as never}

      /* -------------------------------------
         WARD STYLE
      ------------------------------------- */

      style={(feature) => {
        const metric =
          getWardMetric(
            feature?.properties,
            metrics
          );

        const intensity =
          getIntensity(
            metric?.complaintCount ?? 0,
            maxComplaints
          );

        const isSelected =
          selectedWard?.ward &&
          metric?.ward &&
          normalizeWard(
            selectedWard.ward
          ) ===
            normalizeWard(
              metric.ward
            );

        return {
          color: isSelected
            ? "#ffffff"
            : "#38bdf8",

          weight: isSelected
            ? 3
            : 1,

          fillColor: "#2563eb",

          fillOpacity: metric
            ? intensity
            : 0.08,
        };
      }}

      /* -------------------------------------
         EACH WARD
      ------------------------------------- */

      onEachFeature={(
        feature,
        layer: Layer
      ) => {
        const metric =
          getWardMetric(
            feature.properties,
            metrics
          );

        const wardName =
          getWardName(
            feature.properties
          ) || "Unknown Ward";

        const wardNumber =
          getWardNumber(
            feature.properties
          );

        /* -----------------------------------
           TOOLTIP
        ----------------------------------- */

        layer.bindTooltip(
          `
          <strong>${wardName}</strong>
          ${
            wardNumber
              ? `<br/>Ward No: ${wardNumber}`
              : ""
          }
          ${
            metric
              ? `<br/>Complaints: ${metric.complaintCount}`
              : ""
          }
          `,
          {
            sticky: true,
            direction: "top",
          }
        );

        /*
         * GeoJSON polygon is a Leaflet Path.
         * Narrow generic Layer → Path.
         */

        const pathLayer =
          layer as Path;

        /* -----------------------------------
           MOUSE EVENTS
        ----------------------------------- */

        pathLayer.on({
          /* ---------------------------------
             HOVER IN
          --------------------------------- */

          mouseover: (
            event: LeafletEvent
          ) => {
            const currentLayer =
              event.target as Path;

            currentLayer.setStyle({
              weight: 3,
              color: "#ffffff",
              fillOpacity: 0.85,
            });
          },

          /* ---------------------------------
             HOVER OUT
          --------------------------------- */

          mouseout: (
            event: LeafletEvent
          ) => {
            const currentLayer =
              event.target as Path;

            const current =
              getWardMetric(
                feature.properties,
                metrics
              );

            const intensity =
              getIntensity(
                current?.complaintCount ??
                  0,
                maxComplaints
              );

            const isSelected =
              selectedWard?.ward &&
              current?.ward &&
              normalizeWard(
                selectedWard.ward
              ) ===
                normalizeWard(
                  current.ward
                );

            currentLayer.setStyle({
              weight: isSelected
                ? 3
                : 1,

              color: isSelected
                ? "#ffffff"
                : "#38bdf8",

              fillOpacity: current
                ? intensity
                : 0.08,
            });
          },

          /* ---------------------------------
             CLICK WARD
          --------------------------------- */

          click: () => {
            if (!metric) {
              console.warn(
                "WARD_METRIC_NOT_FOUND:",
                {
                  wardName,
                  wardNumber,
                }
              );

              return;
            }

            setSelectedWard(metric);

            onSelect(metric);
          },
        });
      }}
    />
  );
}