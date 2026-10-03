import { useId } from 'react';

export interface Choice<T extends string> {
  value: T;
  label: string;
}

interface ChoiceGroupProps<T extends string> {
  legend: string;
  /** Hide the legend visually (it stays for screen readers). */
  hideLegend?: boolean;
  choices: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A clear one-tap choice between a few options (radio buttons styled as pills). */
export function ChoiceGroup<T extends string>(props: ChoiceGroupProps<T>) {
  const name = useId();
  return (
    <fieldset>
      <legend className={props.hideLegend ? 'sr-only' : 'mb-1.5 text-sm font-semibold'}>
        {props.legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {props.choices.map((choice) => (
          <label
            key={choice.value}
            className={`cursor-pointer rounded-lg border px-4 py-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foam ${
              props.value === choice.value
                ? 'border-foam bg-foam/10 font-semibold text-foam-dark'
                : 'border-line bg-surface'
            }`}
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={props.value === choice.value}
              onChange={() => props.onChange(choice.value)}
            />
            {choice.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
