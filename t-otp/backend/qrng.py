from qiskit import QuantumCircuit
from qiskit_ibm_runtime import QiskitRuntimeService, Sampler, Session
from qiskit_aer import AerSimulator

def build_qrng_circuit(n_qubits):
    qc = QuantumCircuit(1, 1)
    qc.h(0)            # Hadamard gate -> |0> + |1>
    qc.measure(0, 0)   # measure into classical bit
    return qc

def get_random_bits(n_bits, sampler):
    qc = build_qrng_circuit(1)  # Create the QRNG circuit
    result = sampler.run([qc]*n_bits).result()
    bits = []
    for quasi_dist in result.quasi_dists:
        bit = max(quasi_dist.items(), key=lambda x: x[1])[0]
        bits.append(str(bit))
    return "".join(bits)

# Setup simulator
aer_sim = AerSimulator()

# Create sampler and generate random bits
with Session(backend=aer_sim) as session:
    sampler = Sampler()
    random_8bit = get_random_bits(8, sampler)
    print(f"Random 8-bit number: {random_8bit}")
