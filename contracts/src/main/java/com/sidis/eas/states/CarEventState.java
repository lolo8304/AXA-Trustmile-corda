package com.sidis.eas.states;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sidis.eas.contracts.CarEventContract;
import net.corda.core.contracts.BelongsToContract;
import net.corda.core.contracts.LinearState;
import net.corda.core.contracts.UniqueIdentifier;
import net.corda.core.identity.AbstractParty;
import net.corda.core.identity.Party;
import net.corda.core.serialization.ConstructorForDeserialization;
import org.jetbrains.annotations.NotNull;

import java.security.PublicKey;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@BelongsToContract(CarEventContract.class)
public class CarEventState implements LinearState {

    @NotNull
    private final UniqueIdentifier id;

    @JsonIgnore
    @NotNull
    private final Party insuredCar;

    @NotNull
    private final String vin;

    @NotNull
    private final Integer timestamp;

    @NotNull
    private final Long mileage;

    @NotNull
    private final Boolean accident;

    private final Map<String, Object> data;

    @ConstructorForDeserialization
    public CarEventState(@NotNull UniqueIdentifier id, @NotNull Party insuredCar, @NotNull String vin,
                         @NotNull Integer timestamp, @NotNull Long mileage, @NotNull Boolean accident, Map<String, Object> data) {
        this.id = id;
        this.insuredCar = insuredCar;
        this.vin = vin;
        this.timestamp = timestamp;
        this.mileage = mileage;
        this.accident = accident;
        this.data = data;
    }

    @NotNull
    @Override
    public UniqueIdentifier getLinearId() {
        return this.id;
    }

    @NotNull
    @JsonIgnore
    @Override
    public List<AbstractParty> getParticipants() {
        List<AbstractParty> list = new ArrayList<>();
        list.add(this.insuredCar);
        return list;
    }

    @NotNull
    @JsonIgnore
    public List<PublicKey> getParticipantKeys() {
        return getParticipants().stream().map(AbstractParty::getOwningKey).collect(Collectors.toList());
    }

    @NotNull
    public UniqueIdentifier getId() {
        return id;
    }

    /* please ignore due to issue with Party */
    @JsonIgnore
    @NotNull
    public Party getInsuredCar() {
        return insuredCar;
    }

    @NotNull
    public String getVin() {
        return vin;
    }

    @NotNull
    public Integer getTimestamp() {
        return timestamp;
    }

    @NotNull
    public Long getMileage() {
        return mileage;
    }

    @NotNull
    public Boolean getAccident() {
        return accident;
    }

    public Map<String, Object> getData() {
        return data;
    }

    @NotNull
    public String getInsuredCarX500() {
        return insuredCar.getName().getX500Principal().getName();
    }

    public CarEventState update(@NotNull Integer timestamp, @NotNull Long mileage, @NotNull Boolean accident, Map<String, Object> data) {
        return new CarEventState(this.getId(), this.getInsuredCar(), this.getVin(), timestamp, mileage, accident, data);
    }

    /* actions CREATE */
    public static CarEventState create(@NotNull UniqueIdentifier id, @NotNull Party insuredCar, @NotNull String vin,
                                       @NotNull Integer timestamp, @NotNull Long mileage, @NotNull Boolean accident,
                                       Map<String, Object> data) {
        return new CarEventState(id, insuredCar, vin, timestamp, mileage, accident, data);
    }
}
