## 🗂️ Project Structure

- `app/` → Entry points where agents are triggered
- `components/ui/` → Chat Agent / UI Agent interface
- `components/compound/` → Complex UI controlled by UI Agent
- `components/[feature]/` → Feature-specific agent usage
- `lib/` → Shared logic used by Data Fetch Agent
- `data/` → Static data for Recommendation Agent
- `store/` → State management used by Recommendation & UI Agents
- `types/` → Shared type definitions for all agents

---


## 📏 Rules & Guidelines
- You are a senior Frontend developer. So always build keeping in mind performance, scalability, and maintainability.
- Always separate UI and logic
- Do not expose sensitive data in responses
- Prefer server-side data fetching when possible
- Keep agents stateless (use Redux for state)
- Reuse logic from `lib/` instead of duplicating

---

## 🚨 Error Handling

- API failure → Return fallback UI message
- Empty data → Show empty state component
- Invalid input → Validate before processing

---

## 📌 Notes

- Agents are conceptual layers, not separate services
- Business logic lives in `lib/`
- State is centralized in Redux (`store/`)
- Components remain presentation-focused