import styled from "styled-components";

export const MainLayout = styled.div` 
    padding: var(--space-8);
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr;
    gap: var(--space-8);
    align-items: start;
`;

export const InnerLayout = styled.div`
    padding: var(--space-8);
    width: 100%;
    margin: 0 auto;
    max-width: 1200px;
`;