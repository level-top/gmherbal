import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function baseProps(props: IconProps) {
  const { title, ...rest } = props;
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    ...rest,
    children: (
      <>
        {title ? <title>{title}</title> : null}
        {rest.children}
      </>
    ),
  } as const;
}

export function IconLeaf(props: IconProps) {
  return (
    <svg
      {...baseProps({
        ...props,
        children: (
          <path
            d="M20 4c-6.2 0-10.5 2.2-12.7 4.8C5.5 11.1 5 13.6 5 15.4c0 2.2 1.4 3.6 3.6 3.6 1.8 0 4.3-.5 6.6-2.3C17.8 14.5 20 10.2 20 4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        ),
      })}
    />
  );
}

export function IconDroplet(props: IconProps) {
  return (
    <svg
      {...baseProps({
        ...props,
        children: (
          <path
            d="M12 2s6 6.2 6 12a6 6 0 1 1-12 0c0-5.8 6-12 6-12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        ),
      })}
    />
  );
}

export function IconShieldCheck(props: IconProps) {
  return (
    <svg
      {...baseProps({
        ...props,
        children: (
          <>
            <path
              d="M12 2 20 6v7c0 5-3.3 8.6-8 9-4.7-.4-8-4-8-9V6l8-4Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="m9.2 12.3 2 2.1 3.8-4.1"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ),
      })}
    />
  );
}

export function IconChat(props: IconProps) {
  return (
    <svg
      {...baseProps({
        ...props,
        children: (
          <path
            d="M20 12c0 4.4-3.6 8-8 8-1.2 0-2.4-.3-3.4-.7L4 20l.9-3.3C4.3 15.6 4 13.8 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        ),
      })}
    />
  );
}

export function IconStar(props: IconProps) {
  return (
    <svg
      {...baseProps({
        ...props,
        children: (
          <path
            d="M12 2.7 14.9 9l6.9.6-5.2 4.5 1.6 6.7L12 17.6 5.8 20.8l1.6-6.7L2.2 9.6 9.1 9 12 2.7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        ),
      })}
    />
  );
}
