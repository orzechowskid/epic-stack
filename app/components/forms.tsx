import {
	useInputEvent
} from "@conform-to/react";
import React, {
	useCallback,
	useId,
	useRef
} from "react";

export type ListOfErrors = Array<string | null | undefined> | null | undefined;

export function ErrorList({
	id,
	errors
}: {
	errors?: ListOfErrors;
	id?: string;
}) {
	const errorsToRender = errors?.filter(Boolean);
	if (!errorsToRender?.length) { return null; }
	return (
		<ul className="flex flex-col gap-1" id={id}>
			{errorsToRender.map((e) => {return (
				<li className="text-[10px] text-foreground-danger" key={e}>
					{e}
				</li>
			)})}
		</ul>
	);
}

export function Field({
	labelProps,
	inputProps,
	errors,
	className
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
	inputProps: React.InputHTMLAttributes<HTMLInputElement>;
	errors?: ListOfErrors;
	className?: string;
}) {
	const fallbackId = useId();
	const id = inputProps.id ?? fallbackId;
	const errorId = errors?.length ? `${id}-error` : undefined;
	return (
		<div className={className}>
			<Label htmlFor={id} {...labelProps} />
			<Input
				aria-describedby={errorId}
				aria-invalid={errorId ? true : undefined}
				id={id}
				{...inputProps}
			/>
			<div className="min-h-[32px] px-4 pb-3 pt-1">
				{errorId ? <ErrorList errors={errors} id={errorId} /> : null}
			</div>
		</div>
	);
}

export function TextareaField({
	labelProps,
	textareaProps,
	errors,
	className
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
	textareaProps: React.InputHTMLAttributes<HTMLTextAreaElement>;
	errors?: ListOfErrors;
	className?: string;
}) {
	const fallbackId = useId();
	const id = textareaProps.id ?? textareaProps.name ?? fallbackId;
	const errorId = errors?.length ? `${id}-error` : undefined;
	return (
		<div className={className}>
			<Label htmlFor={id} {...labelProps} />
			<Textarea
				aria-describedby={errorId}
				aria-invalid={errorId ? true : undefined}
				id={id}
				{...textareaProps}
			/>
			<div className="min-h-[32px] px-4 pb-3 pt-1">
				{errorId ? <ErrorList errors={errors} id={errorId} /> : null}
			</div>
		</div>
	);
}

export function CheckboxField({
	labelProps,
	buttonProps,
	errors,
	className
}: {
	labelProps: JSX.IntrinsicElements["label"];
	buttonProps: CheckboxProps;
	errors?: ListOfErrors;
	className?: string;
}) {
	const fallbackId = useId();
	const buttonRef = useRef<HTMLButtonElement>(null);
	// To emulate native events that Conform listen to:
	// See https://conform.guide/integrations
	const control = useInputEvent({
		// Retrieve the checkbox element by name instead as Radix does not expose the internal checkbox element
		// See https://github.com/radix-ui/primitives/discussions/874
		ref: () => {return buttonRef.current?.form?.elements.namedItem(buttonProps.name ?? "")},
		onFocus: () => {return buttonRef.current?.focus()}
	});
	const id = buttonProps.id ?? buttonProps.name ?? fallbackId;
	const errorId = errors?.length ? `${id}-error` : undefined;
	const onBlur = useCallback((event: Event) => {
		control.blur();
		buttonProps.onBlur?.(event);
	}, [ buttonProps, control ]);
	const onCheckedChange = useCallback((state: any) => {
		control.change(Boolean(state.valueOf()));
		buttonProps.onCheckedChange?.(state);
	}, [ buttonProps, control ]);
	const onFocus = useCallback((event: Event) => {
		control.focus();
		buttonProps.onFocus?.(event);
	}, [ buttonProps, control ]);
	return (
		<div className={className}>
			<div className="flex gap-2">
				<Checkbox
					aria-describedby={errorId}
					aria-invalid={errorId ? true : undefined}
					id={id}
					ref={buttonRef}
					{...buttonProps}
					onBlur={onBlur}
					onCheckedChange={onCheckedChange}
					onFocus={onFocus}
					type="button"
				/>
				<label
					htmlFor={id}
					{...labelProps}
					className="self-center text-body-xs text-muted-foreground"
				/>
			</div>
			<div className="px-4 pb-3 pt-1">
				{errorId ? <ErrorList errors={errors} id={errorId} /> : null}
			</div>
		</div>
	);
}
