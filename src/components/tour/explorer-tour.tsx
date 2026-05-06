"use client";

import dynamic from "next/dynamic";
import { useEffect, useCallback } from "react";
import { Box, Flex, Checkbox, Text, Button, IconButton } from "@chakra-ui/react";
import {
  useTour,
  TOUR_OPT_OUT_KEY,
  TOUR_VISITS_KEY,
  TOUR_SESSION_KEY,
  MAX_AUTO_SHOW_VISITS,
} from "@/context/tour";
import { useTranslation } from "react-i18next";
import type { EventData, Step } from "react-joyride";
import { LuCircleHelp, LuMessageCircleQuestion } from "react-icons/lu";

// Dynamically imported to avoid SSR issues. react-joyride v3 uses named export.
const Joyride = dynamic(
  () => import("react-joyride").then((mod) => ({ default: mod.Joyride })),
  { ssr: false },
);

// Separated so the checkbox always reads fresh context state
const WelcomeStepContent = () => {
  const { dontShowAgain, setDontShowAgain } = useTour();
  const { t } = useTranslation();
  return (
    <Box>
      <Text mb={4}>{t("tour.step1.content")}</Text>
      <Checkbox.Root
        checked={dontShowAgain}
        onCheckedChange={({ checked }) => setDontShowAgain(!!checked)}
        size="sm"
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label color="fg.muted">{t("tour.dontShowAgain")}</Checkbox.Label>
      </Checkbox.Root>
    </Box>
  );
};

export function ExplorerTour() {
  const { t } = useTranslation();
  const {
    isRunning,
    stepIndex,
    setStepIndex,
    startTour,
    stopTour,
    callAction,
  } = useTour();

  // Auto-start: count one visit per browser session, show for first N sessions
  useEffect(() => {
    const optOut = localStorage.getItem(TOUR_OPT_OUT_KEY) === "true";
    if (optOut) return;

    const alreadyCounted = sessionStorage.getItem(TOUR_SESSION_KEY) === "true";
    if (!alreadyCounted) {
      sessionStorage.setItem(TOUR_SESSION_KEY, "true");
      const visits = parseInt(localStorage.getItem(TOUR_VISITS_KEY) ?? "0", 10);
      const newVisits = visits + 1;
      localStorage.setItem(TOUR_VISITS_KEY, String(newVisits));

      if (newVisits <= MAX_AUTO_SHOW_VISITS) {
        const id = setTimeout(() => startTour(false), 900);
        return () => clearTimeout(id);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      skipBeacon: true,
      title: t("tour.step1.title"),
      content: <WelcomeStepContent />,
    },
    {
      target: '[data-tour="side-nav"]',
      placement: "right",
      skipBeacon: true,
      title: t("tour.step2.title"),
      content: t("tour.step2.content"),
    },
    {
      target: '[data-tour="scenario-select"]',
      placement: "right",
      skipBeacon: true,
      title: t("tour.step3.title"),
      content: t("tour.step3.content"),
    },
    {
      target: '[data-tour="filters-panel"]',
      placement: "right",
      skipBeacon: true,
      title: t("tour.step4.title"),
      content: t("tour.step4.content"),
    },
    {
      target: '[data-tour="map"]',
      placement: "left",
      skipBeacon: true,
      title: t("tour.step5.title"),
      content: t("tour.step5.content"),
    },
    {
      target: '[data-tour="summary-panel"]',
      placement: "left",
      skipBeacon: true,
      title: t("tour.step6.title"),
      content: t("tour.step6.content"),
    },
    {
      target: '[data-tour="summary-panel"]',
      placement: "left",
      skipBeacon: true,
      title: t("tour.step7.title"),
      content: t("tour.step7.content"),
    },
    {
      target: '[data-tour="filters-panel"]',
      placement: "right",
      skipBeacon: true,
      title: t("tour.step8.title"),
      content: t("tour.step8.content"),
    },
  ];

  const handleEvent = useCallback(
    (data: EventData) => {
      const { action, index, status, type } = data;

      if (type === "step:after" || type === "error:target_not_found") {
        const isNext = action === "next";
        const isPrev = action === "prev";

        if (isNext) {
          if (index === 5) {
            // Leaving national summary step — select a demo cluster
            callAction("selectDemoCluster");
          }
          if (index === 6) {
            // Switch to layers tab, wait for DOM update, then advance
            callAction("switchToLayers");
            setTimeout(() => setStepIndex(7), 200);
            return;
          }
        }
        if (isPrev && index === 7) {
          // Going back from layers step — restore controls tab
          callAction("switchToControls");
        }

        setStepIndex(index + (isPrev ? -1 : 1));
      }

      if (status === "finished" || status === "skipped") {
        stopTour();
      }
    },
    [callAction, setStepIndex, stopTour],
  );

  return (
    <Joyride
      steps={steps}
      run={isRunning}
      stepIndex={stepIndex}
      onEvent={handleEvent}
      continuous
      options={{
        buttons: ["back", "primary", "skip"],
        showProgress: true,
        skipBeacon: true,
        primaryColor: "#CC5500",
        zIndex: 9999,
        overlayColor: "rgba(0,0,0,0.4)",
      }}
      locale={{
        back: t("tour.back"),
        close: t("tour.close"),
        last: t("tour.finish"),
        next: t("tour.next"),
        nextWithProgress: t("tour.nextWithProgress"),
        skip: t("tour.skip"),
      }}
      styles={{
        tooltip: {
          borderRadius: "8px",
          padding: "16px 20px",
          maxWidth: "360px",
        },
        tooltipTitle: {
          fontSize: "1rem",
          fontWeight: 600,
          marginBottom: "8px",
          textAlign: "left",
        },
        tooltipContent: {
          padding: "0 0 8px",
          fontSize: "0.875rem",
          lineHeight: 1.25,
          textAlign: "left",
        },
        buttonPrimary: {
          backgroundColor: "#CC5500",
          borderRadius: "6px",
          fontSize: "0.875rem",
          padding: "8px 12px",
        },
        buttonBack: {
          color: "#CC5500",
          fontSize: "0.875rem",
          padding: "8px 12px",
        },
        buttonSkip: {
          color: "#888",
          fontSize: "0.875rem",
        },
        buttonClose: {
          top: "12px",
          right: "12px",
        },
      }}
    />
  );
}

export function TourHelpButton() {
  const { startTour } = useTour();
  const { t } = useTranslation();

  return (
    <IconButton
      aria-label={t("tour.openTour")}
      onClick={() => startTour(true)}
      variant="plain"
      colorPalette="orange"
      color="orange.contrast"
      cursor="pointer"
      _hover={{ opacity: 1 }}
      transition="opacity 0.15s"
    >
      <LuCircleHelp size={18} />
    </IconButton>
  );
}
