/*
 * Copyright (c) MuleSoft, Inc.  All rights reserved.  http://www.mulesoft.com
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.txt file.
 */

package org.mule.module.apikit.rest.integration;

import org.mule.api.annotations.ContainsTransformerMethods;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonProperty;

import javax.xml.bind.annotation.XmlRootElement;

@ContainsTransformerMethods
@JsonAutoDetect
@XmlRootElement(namespace = "http://mulesoft.com/schemas/soccer")
public class Team
{

    private String id;
    private String name;

    public String getId()
    {
        return id;
    }

    public void setId(String id)
    {
        this.id = id;
    }

    @JsonProperty
    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

}
