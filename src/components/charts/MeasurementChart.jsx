import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { EmptyState } from "../ui/EmptyState";
import { formatDate } from "../../lib/formatters";

function getPointColor(category) {
  const normalized = (category ?? "").toLowerCase();

  if (normalized.includes("normal") || normalized.includes("medium")) {
    return "#15803d";
  }

  if (normalized.includes("ust") || normalized.includes("small")) {
    return "#2563eb";
  }

  if (normalized.includes("alt") || normalized.includes("large")) {
    return "#ea580c";
  }

  return "#64748b";
}

export function MeasurementChart({
  measurements,
  title,
  description,
  featured = false,
  eyebrow = "Trend Grafigi",
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const sortedMeasurements = measurements?.length
    ? [...measurements].sort(
        (left, right) =>
          new Date(left.measurementDate).getTime() -
          new Date(right.measurementDate).getTime(),
      )
    : [];
  const latestMeasurement = sortedMeasurements.at(-1);

  useEffect(() => {
    if (!canvasRef.current || !measurements?.length) {
      return undefined;
    }

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const sorted = [...measurements].sort(
      (left, right) =>
        new Date(left.measurementDate).getTime() -
        new Date(right.measurementDate).getTime(),
    );

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: sorted.map((item) => formatDate(item.measurementDate)),
        datasets: [
          {
            label: "Frame Index",
            data: sorted.map((item) => item.frameIndex),
            borderColor: "#1d4ed8",
            backgroundColor: "rgba(37, 99, 235, 0.18)",
            pointBackgroundColor: sorted.map((item) =>
              getPointColor(item.frameCategory),
            ),
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 5,
            borderWidth: 3,
            tension: 0.35,
            yAxisID: "y",
          },
          {
            label: "Z-Score",
            data: sorted.map((item) => item.zScore),
            borderColor: "#14b8a6",
            backgroundColor: "rgba(20, 184, 166, 0.16)",
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: "#0f766e",
            tension: 0.35,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: !featured,
            position: "bottom",
          },
          tooltip: {
            backgroundColor: "#0f172a",
            callbacks: {
              afterBody(items) {
                const index = items?.[0]?.dataIndex ?? 0;
                const row = sorted[index];
                return [
                  `Kategori: ${row.frameCategory}`,
                  `Kaydeden: ${row.recordedByName ?? row.recordedByRole}`,
                ];
              },
            },
          },
        },
        scales: {
          y: {
            position: "left",
            title: {
              display: true,
              text: "Frame Index",
            },
            grid: {
              color: "rgba(148, 163, 184, 0.15)",
            },
          },
          y1: {
            position: "right",
            title: {
              display: true,
              text: "Z-Score",
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          x: {
            grid: {
              color: "rgba(148, 163, 184, 0.08)",
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [featured, measurements]);

  return (
    <section className={`surface-card chart-panel${featured ? " featured" : ""}`}>
      <div className="section-heading chart-panel-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
        {featured ? (
          <div className="chart-panel-summary">
            <span>{measurements?.length ?? 0} kayit</span>
            <strong>
              {latestMeasurement
                ? formatDate(latestMeasurement.measurementDate)
                : "Veri bekleniyor"}
            </strong>
          </div>
        ) : description ? (
          <p className="section-copy">{description}</p>
        ) : null}
      </div>

      {featured && description ? <p className="chart-panel-copy">{description}</p> : null}

      {!measurements?.length ? (
        <EmptyState
          title="Grafik icin veri bekleniyor"
          description="Ilk olcumu kaydettiginizde zaman icindeki degisimi burada goreceksiniz."
        />
      ) : (
        <div className="chart-shell">
          <canvas ref={canvasRef} />
        </div>
      )}
    </section>
  );
}
