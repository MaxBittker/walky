import { useState, useRef, useEffect } from "react";

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// returns true when input has been truthy for n milliseconds
export function useDelayedGate(inputValue: boolean, delayMs = 300) {
  const isInputTruthy = !!inputValue;
  const wasInputTruthy = usePrevious(isInputTruthy);

  const [output, setOutput] = useState(isInputTruthy);

  const disabledTimeout = useRef(null);
  // Clear timeout on unmount.
  useEffect(
    () => () => {
      setOutput(false);
      clearTimeout(disabledTimeout.current);
    },
    []
  );
  useEffect(() => {
    // rising edge (slow)
    if (isInputTruthy) {
      disabledTimeout.current = setTimeout(() => {
        setOutput(true);
      }, delayMs);
    } else {
      // falling edge (immediate)
      setOutput(false);
    }
    return () => {
      clearTimeout(disabledTimeout.current);
    };
    // maybe this logic could be cleaner if we returned a useEffect callback here?
  }, [delayMs, isInputTruthy, wasInputTruthy]);
  return output;
}
